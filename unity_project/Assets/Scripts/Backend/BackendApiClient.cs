using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace TamilNaduBusSim.Backend
{
    [Serializable]
    public class LoginRequest
    {
        public string username;
        public string password;
    }

    [Serializable]
    public class LoginResponse
    {
        public string access_token;
        public string token_type;
        public int user_id;
        public string username;
    }

    [Serializable]
    public class ProfileData
    {
        public int id;
        public int user_id;
        public string username;
        public string display_name;
        public int coins;
        public int driver_level;
        public float driving_rating;
        public float total_distance_km;
        public int passengers_transported;
        public int trips_completed;
        public float bus_health_percent;
        public float current_fuel_liters;
    }

    [Serializable]
    public class CompleteMissionPayload
    {
        public int mission_id;
        public float distance_covered_km;
        public int passengers_served;
        public float passenger_satisfaction;
        public int traffic_violations;
        public int accidents_count;
        public float fuel_used_liters;
    }

    /// <summary>
    /// Unity REST Client connecting to Python FastAPI backend server.
    /// Manages Authentication, Player Profile Sync, Showroom Catalog and Cloud Saves.
    /// </summary>
    public class BackendApiClient : MonoBehaviour
    {
        public static BackendApiClient Instance { get; private set; }

        [SerializeField] private string apiBaseUrl = "http://localhost:8000/api/v1";
        private string jwtToken = "";

        public ProfileData CurrentProfile { get; private set; }
        public bool IsConnected { get; private set; }

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
            }
        }

        private void Start()
        {
            StartCoroutine(CheckBackendHealth());
        }

        public IEnumerator CheckBackendHealth()
        {
            using (UnityWebRequest req = UnityWebRequest.Get("http://localhost:8000/health"))
            {
                yield return req.SendWebRequest();
                if (req.result == UnityWebRequest.Result.Success)
                {
                    IsConnected = true;
                    Debug.Log("Connected to Tamil Nadu Bus Simulator FastAPI Backend!");
                }
                else
                {
                    IsConnected = false;
                    Debug.LogWarning("FastAPI backend not responding, running offline mode.");
                }
            }
        }

        public IEnumerator LoginUser(string username, string password, Action<bool> onComplete = null)
        {
            string url = $"{apiBaseUrl}/auth/login";
            LoginRequest reqObj = new LoginRequest { username = username, password = password };
            string jsonBody = JsonUtility.ToJson(reqObj);

            using (UnityWebRequest req = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    LoginResponse res = JsonUtility.FromJson<LoginResponse>(req.downloadHandler.text);
                    jwtToken = res.access_token;
                    yield return FetchProfileCoroutine();
                    onComplete?.Invoke(true);
                }
                else
                {
                    Debug.LogError($"Login failed: {req.error}");
                    onComplete?.Invoke(false);
                }
            }
        }

        public IEnumerator FetchProfileCoroutine()
        {
            string url = $"{apiBaseUrl}/profile";
            using (UnityWebRequest req = UnityWebRequest.Get(url))
            {
                req.SetRequestHeader("Authorization", $"Bearer {jwtToken}");
                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    CurrentProfile = JsonUtility.FromJson<ProfileData>(req.downloadHandler.text);
                    Debug.Log($"Loaded Driver Profile: {CurrentProfile.display_name}, Coins: ₹{CurrentProfile.coins}");
                }
            }
        }

        public IEnumerator CompleteMissionCoroutine(CompleteMissionPayload payload, Action<string> onComplete = null)
        {
            string url = $"{apiBaseUrl}/routes/complete";
            string jsonBody = JsonUtility.ToJson(payload);

            using (UnityWebRequest req = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(jsonBody);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");
                req.SetRequestHeader("Authorization", $"Bearer {jwtToken}");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    yield return FetchProfileCoroutine();
                    onComplete?.Invoke(req.downloadHandler.text);
                }
                else
                {
                    Debug.LogError($"Error submitting mission: {req.error}");
                    onComplete?.Invoke(null);
                }
            }
        }
    }
}
