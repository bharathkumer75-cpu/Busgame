using UnityEngine;

namespace TamilNaduBusSim.AI
{
    /// <summary>
    /// Autonomous Indian AI Traffic Vehicle Controller
    /// Follows highway waypoints, performs obstacle detection raycasts,
    /// and exhibits realistic lane behavior (including auto-rickshaws and heavy trucks).
    /// </summary>
    public class TrafficCarAI : MonoBehaviour
    {
        [Header("Traffic Dynamics")]
        [SerializeField] private float cruisingSpeedKmh = 60f;
        [SerializeField] private float raycastDistance = 15f;
        [SerializeField] private LayerMask obstacleLayers;

        [Header("Waypoints")]
        [SerializeField] private Transform[] waypoints;
        private int currentWaypointIndex = 0;

        private float currentSpeedMs;
        private float targetSpeedMs;

        private void Start()
        {
            targetSpeedMs = cruisingSpeedKmh / 3.6f;
            currentSpeedMs = targetSpeedMs;
        }

        private void Update()
        {
            HandleObstacleDetection();
            MoveTowardsWaypoint();
        }

        private void HandleObstacleDetection()
        {
            RaycastHit hit;
            Vector3 origin = transform.position + Vector3.up * 0.8f;

            // Forward obstacle detection raycast
            if (Physics.Raycast(origin, transform.forward, out hit, raycastDistance, obstacleLayers))
            {
                // Brake to match lead vehicle speed or stop
                float distFactor = Mathf.Clamp01(hit.distance / raycastDistance);
                currentSpeedMs = Mathf.Lerp(0f, targetSpeedMs, distFactor * 0.8f);
            }
            else
            {
                // Accelerate back to cruising speed
                currentSpeedMs = Mathf.MoveTowards(currentSpeedMs, targetSpeedMs, Time.deltaTime * 6f);
            }
        }

        private void MoveTowardsWaypoint()
        {
            if (waypoints == null || waypoints.Length == 0)
            {
                // Simple forward motion along highway
                transform.position += transform.forward * currentSpeedMs * Time.deltaTime;
                return;
            }

            Transform target = waypoints[currentWaypointIndex];
            Vector3 direction = (target.position - transform.position).normalized;
            direction.y = 0;

            if (direction != Vector3.zero)
            {
                Quaternion targetRot = Quaternion.LookRotation(direction);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRot, Time.deltaTime * 3.5f);
            }

            transform.position += transform.forward * currentSpeedMs * Time.deltaTime;

            if (Vector3.Distance(transform.position, target.position) < 3.0f)
            {
                currentWaypointIndex = (currentWaypointIndex + 1) % waypoints.Length;
            }
        }
    }
}
