using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace TamilNaduBusSim.Vehicles
{
    /// <summary>
    /// Realistic 12-Meter Commercial Bus Physics Controller
    /// Uses Unity WheelCollider components for authentic weight, inertia, 
    /// pneumatic braking, and suspension dynamics.
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class BusController : MonoBehaviour
    {
        [Header("Wheel Colliders (Front Steer & Rear Drive)")]
        [SerializeField] private WheelCollider frontLeftWheel;
        [SerializeField] private WheelCollider frontRightWheel;
        [SerializeField] private WheelCollider rearLeftWheelInner;
        [SerializeField] private WheelCollider rearLeftWheelOuter;
        [SerializeField] private WheelCollider rearRightWheelInner;
        [SerializeField] private WheelCollider rearRightWheelOuter;

        [Header("Wheel Transform Visuals")]
        [SerializeField] private Transform frontLeftTransform;
        [SerializeField] private Transform frontRightTransform;
        [SerializeField] private Transform rearLeftTransform;
        [SerializeField] private Transform rearRightTransform;

        [Header("Engine & Transmission")]
        [Tooltip("Maximum motor torque in Newton-meters (Ashok Leyland 210HP Engine)")]
        [SerializeField] private float maxMotorTorque = 900f;
        [SerializeField] private float maxBrakeTorque = 4500f;
        [SerializeField] private float maxSteerAngle = 33f;
        [SerializeField] private float topSpeedKmh = 115f;
        [SerializeField] private float[] gearRatios = { 3.8f, 2.4f, 1.6f, 1.2f, 0.9f, 0.72f };
        [SerializeField] private float reverseRatio = 4.0f;

        [Header("Chassis & Center of Mass")]
        [SerializeField] private Vector3 centerOfMassOffset = new Vector3(0f, -0.65f, 0.2f);
        [SerializeField] private float downforceFactor = 40f;

        // Public Telemetry Properties
        public float CurrentSpeedKmh { get; private set; }
        public float CurrentRpm { get; private set; }
        public int CurrentGear { get; private set; }
        public bool IsReverse { get; private set; }
        public bool HandbrakeEngaged { get; private set; }
        public float SteeringInput { get; private set; }
        public float ThrottleInput { get; private set; }

        private Rigidbody rb;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.mass = 14500f; // 14.5 tonnes loaded commercial bus
            rb.centerOfMass = centerOfMassOffset;
        }

        private void Update()
        {
            ReadInputs();
            UpdateWheelMeshPositions();
            CalculateSpeedAndRpm();
        }

        private void FixedUpdate()
        {
            ApplyMotorForce();
            ApplySteering();
            ApplyBraking();
            ApplyDownforce();
        }

        private void ReadInputs()
        {
            ThrottleInput = Input.GetAxis("Vertical");
            SteeringInput = Input.GetAxis("Horizontal");
            HandbrakeEngaged = Input.GetKey(KeyCode.Space);

            if (Input.GetKeyDown(KeyCode.R))
            {
                IsReverse = !IsReverse;
            }
        }

        private void ApplyMotorForce()
        {
            CurrentSpeedKmh = rb.velocity.magnitude * 3.6f;

            if (CurrentSpeedKmh >= topSpeedKmh && ThrottleInput > 0)
            {
                // Speed governor limit
                SetMotorTorque(0f);
                return;
            }

            float currentRatio = IsReverse ? -reverseRatio : (gearRatios[Mathf.Clamp(CurrentGear - 1, 0, gearRatios.Length - 1)]);
            float torque = ThrottleInput * (maxMotorTorque * currentRatio);

            // Apply drive torque to rear dual wheels
            rearLeftWheelInner.motorTorque = torque * 0.5f;
            rearLeftWheelOuter.motorTorque = torque * 0.5f;
            rearRightWheelInner.motorTorque = torque * 0.5f;
            rearRightWheelOuter.motorTorque = torque * 0.5f;
        }

        private void ApplySteering()
        {
            // Speed-sensitive steering reduction for realistic stability
            float speedFactor = Mathf.Clamp01(1.0f - (CurrentSpeedKmh / 140.0f));
            float steer = SteeringInput * maxSteerAngle * Mathf.Max(0.35f, speedFactor);

            frontLeftWheel.steerAngle = steer;
            frontRightWheel.steerAngle = steer;
        }

        private void ApplyBraking()
        {
            float brake = 0f;
            if (ThrottleInput < 0 && !IsReverse)
            {
                brake = Mathf.Abs(ThrottleInput) * maxBrakeTorque;
            }
            else if (HandbrakeEngaged)
            {
                brake = maxBrakeTorque * 1.5f;
            }

            frontLeftWheel.brakeTorque = brake * 0.6f;
            frontRightWheel.brakeTorque = brake * 0.6f;
            rearLeftWheelInner.brakeTorque = brake;
            rearLeftWheelOuter.brakeTorque = brake;
            rearRightWheelInner.brakeTorque = brake;
            rearRightWheelOuter.brakeTorque = brake;
        }

        private void ApplyDownforce()
        {
            rb.AddForce(-transform.up * downforceFactor * rb.velocity.magnitude);
        }

        private void CalculateSpeedAndRpm()
        {
            if (IsReverse)
            {
                CurrentGear = -1;
                CurrentRpm = Mathf.Lerp(650f, 2200f, CurrentSpeedKmh / 25f);
                return;
            }

            // Gear selection
            if (CurrentSpeedKmh < 18) CurrentGear = 1;
            else if (CurrentSpeedKmh < 35) CurrentGear = 2;
            else if (CurrentSpeedKmh < 55) CurrentGear = 3;
            else if (CurrentSpeedKmh < 75) CurrentGear = 4;
            else if (CurrentSpeedKmh < 95) CurrentGear = 5;
            else CurrentGear = 6;

            float minSpeed = (CurrentGear == 1) ? 0 : (CurrentGear - 1) * 18f;
            float maxSpeed = CurrentGear * 20f;
            float progress = Mathf.Clamp01((CurrentSpeedKmh - minSpeed) / (maxSpeed - minSpeed));

            CurrentRpm = Mathf.Lerp(650f, 2400f, progress);
        }

        private void UpdateWheelMeshPositions()
        {
            UpdateSingleWheel(frontLeftWheel, frontLeftTransform);
            UpdateSingleWheel(frontRightWheel, frontRightTransform);
            UpdateSingleWheel(rearLeftWheelOuter, rearLeftTransform);
            UpdateSingleWheel(rearRightWheelOuter, rearRightTransform);
        }

        private void UpdateSingleWheel(WheelCollider col, Transform trans)
        {
            if (col == null || trans == null) return;
            col.GetWorldPose(out Vector3 pos, out Quaternion rot);
            trans.position = pos;
            trans.rotation = rot;
        }

        private void SetMotorTorque(float torque)
        {
            rearLeftWheelInner.motorTorque = torque;
            rearLeftWheelOuter.motorTorque = torque;
            rearRightWheelInner.motorTorque = torque;
            rearRightWheelOuter.motorTorque = torque;
        }
    }
}
