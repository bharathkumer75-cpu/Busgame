using UnityEngine;

namespace TamilNaduBusSim.Vehicles
{
    /// <summary>
    /// Audio manager for realistic multi-layer diesel engine sounds,
    /// pneumatic air brake hiss, and Tamil Nadu musical horns.
    /// </summary>
    public class BusSoundController : MonoBehaviour
    {
        [SerializeField] private BusController busController;

        [Header("Audio Sources")]
        [SerializeField] private AudioSource engineAudioSource;
        [SerializeField] private AudioSource airBrakeAudioSource;
        [SerializeField] private AudioSource hornAudioSource;

        [Header("Audio Clips")]
        [SerializeField] private AudioClip engineIdleLoop;
        [SerializeField] private AudioClip engineAccelLoop;
        [SerializeField] private AudioClip airBrakeHiss;
        [SerializeField] private AudioClip indianMusicalHorn;

        [Header("Engine Pitch Settings")]
        [SerializeField] private float minPitch = 0.75f;
        [SerializeField] private float maxPitch = 2.1f;
        [SerializeField] private float pitchSmoothing = 5.0f;

        private float targetPitch;

        private void Start()
        {
            if (engineAudioSource != null && engineIdleLoop != null)
            {
                engineAudioSource.clip = engineIdleLoop;
                engineAudioSource.loop = true;
                engineAudioSource.Play();
            }
        }

        private void Update()
        {
            if (busController == null) return;

            // Pitch shift based on engine RPM
            float rpmRatio = Mathf.Clamp01((busController.CurrentRpm - 650f) / (2400f - 650f));
            targetPitch = Mathf.Lerp(minPitch, maxPitch, rpmRatio);

            if (engineAudioSource != null)
            {
                engineAudioSource.pitch = Mathf.Lerp(engineAudioSource.pitch, targetPitch, Time.deltaTime * pitchSmoothing);
                engineAudioSource.volume = Mathf.Lerp(0.5f, 1.0f, busController.ThrottleInput);
            }

            // Air Horn Trigger
            if (Input.GetKeyDown(KeyCode.H))
            {
                PlayMusicalHorn();
            }

            // Air Brake Release Trigger
            if (Input.GetKeyUp(KeyCode.Space) || (Input.GetKeyUp(KeyCode.S) && busController.CurrentSpeedKmh > 5f))
            {
                PlayAirBrakeHiss();
            }
        }

        public void PlayMusicalHorn()
        {
            if (hornAudioSource != null && indianMusicalHorn != null)
            {
                hornAudioSource.PlayOneShot(indianMusicalHorn);
            }
        }

        public void PlayAirBrakeHiss()
        {
            if (airBrakeAudioSource != null && airBrakeHiss != null)
            {
                airBrakeAudioSource.PlayOneShot(airBrakeHiss);
            }
        }
    }
}
