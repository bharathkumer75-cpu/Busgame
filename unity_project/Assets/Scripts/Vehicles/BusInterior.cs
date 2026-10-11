using UnityEngine;

namespace TamilNaduBusSim.Vehicles
{
    /// <summary>
    /// Controls cockpit visual elements: steering wheel rotation, speedometer/tachometer needles,
    /// and driver viewpoint stabilization.
    /// </summary>
    public class BusInterior : MonoBehaviour
    {
        [SerializeField] private BusController busController;
        [SerializeField] private Transform steeringWheelTransform;
        [SerializeField] private Transform speedometerNeedle;
        [SerializeField] private Transform tachometerNeedle;

        [Header("Steering Wheel Calibration")]
        [Tooltip("Max angle steering wheel rotates in degrees (e.g. 540 degrees for 1.5 turns)")]
        [SerializeField] private float maxWheelRotationDegrees = 540f;
        [SerializeField] private float steeringSmoothing = 8f;

        [Header("Dashboard Needles Calibration")]
        [SerializeField] private float speedZeroAngle = 0f;
        [SerializeField] private float speedMaxAngle = -240f;
        [SerializeField] private float maxDialSpeedKmh = 140f;

        [SerializeField] private float rpmZeroAngle = 0f;
        [SerializeField] private float rpmMaxAngle = -220f;
        [SerializeField] private float maxDialRpm = 3000f;

        private float currentSteerAngle = 0f;

        private void Update()
        {
            if (busController == null) return;

            // 1. Animated Steering Wheel
            float targetSteerAngle = -busController.SteeringInput * maxWheelRotationDegrees;
            currentSteerAngle = Mathf.Lerp(currentSteerAngle, targetSteerAngle, Time.deltaTime * steeringSmoothing);

            if (steeringWheelTransform != null)
            {
                steeringWheelTransform.localRotation = Quaternion.Euler(0f, 0f, currentSteerAngle);
            }

            // 2. Speedometer Needle
            if (speedometerNeedle != null)
            {
                float speedFraction = Mathf.Clamp01(busController.CurrentSpeedKmh / maxDialSpeedKmh);
                float needleZ = Mathf.Lerp(speedZeroAngle, speedMaxAngle, speedFraction);
                speedometerNeedle.localRotation = Quaternion.Euler(0f, 0f, needleZ);
            }

            // 3. Tachometer Needle
            if (tachometerNeedle != null)
            {
                float rpmFraction = Mathf.Clamp01(busController.CurrentRpm / maxDialRpm);
                float rpmZ = Mathf.Lerp(rpmZeroAngle, rpmMaxAngle, rpmFraction);
                tachometerNeedle.localRotation = Quaternion.Euler(0f, 0f, rpmZ);
            }
        }
    }
}
