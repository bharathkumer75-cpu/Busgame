using UnityEngine;

namespace TamilNaduBusSim.Environment
{
    /// <summary>
    /// Dynamic Day and Night Cycle for Tamil Nadu highways and cities.
    /// Rotates directional sunlight, modulates ambient colors, and toggles highway streetlights.
    /// </summary>
    public class DayNightCycle : MonoBehaviour
    {
        [Header("Sun & Sky Lighting")]
        [SerializeField] private Light sunLight;
        [SerializeField] private float dayDurationSeconds = 360f; // 6 minutes for full 24h cycle
        [SerializeField] private Material skyboxMaterial;

        [Header("Colors & Fog")]
        [SerializeField] private Gradient sunColorGradient;
        [SerializeField] private Gradient ambientColorGradient;
        [SerializeField] private Gradient fogColorGradient;

        [Header("Streetlights Parent")]
        [SerializeField] private GameObject streetlightsParent;

        [Range(0f, 1f)]
        public float timeOfDay = 0.35f; // 0.0 = midnight, 0.25 = 6am dawn, 0.5 = noon, 0.75 = 6pm sunset

        private void Update()
        {
            timeOfDay += (Time.deltaTime / dayDurationSeconds);
            if (timeOfDay >= 1f) timeOfDay = 0f;

            UpdateSunRotation();
            UpdateLightingColors();
            CheckStreetlights();
        }

        private void UpdateSunRotation()
        {
            if (sunLight == null) return;
            float sunAngle = (timeOfDay * 360f) - 90f;
            sunLight.transform.rotation = Quaternion.Euler(sunAngle, 170f, 0f);
        }

        private void UpdateLightingColors()
        {
            if (sunLight == null) return;
            sunLight.color = sunColorGradient.Evaluate(timeOfDay);
            RenderSettings.ambientLight = ambientColorGradient.Evaluate(timeOfDay);
            RenderSettings.fogColor = fogColorGradient.Evaluate(timeOfDay);

            // Hide directional sun shadow at night
            sunLight.intensity = Mathf.Clamp01(Vector3.Dot(sunLight.transform.forward, Vector3.down) * 2f);
        }

        private void CheckStreetlights()
        {
            if (streetlightsParent == null) return;
            bool isNight = (timeOfDay < 0.22f || timeOfDay > 0.78f);
            if (streetlightsParent.activeSelf != isNight)
            {
                streetlightsParent.SetActive(isNight);
            }
        }
    }
}
