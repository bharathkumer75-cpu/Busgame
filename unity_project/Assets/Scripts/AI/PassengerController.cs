using UnityEngine;
using UnityEngine.AI;

namespace TamilNaduBusSim.AI
{
    /// <summary>
    /// Passenger NPC controller for Tamil Nadu bus stops.
    /// Manages waiting at bus shelters, walking to bus door upon stopping,
    /// and boarding seat animations.
    /// </summary>
    public class PassengerController : MonoBehaviour
    {
        [SerializeField] private NavMeshAgent navAgent;
        [SerializeField] private Animator animator;

        public bool isBoarded = false;

        private void Awake()
        {
            if (navAgent == null) navAgent = GetComponent<NavMeshAgent>();
            if (animator == null) animator = GetComponent<Animator>();
        }

        public void BoardBus(Transform busDoorTransform)
        {
            if (isBoarded || busDoorTransform == null) return;

            if (navAgent != null && navAgent.isActiveAndEnabled)
            {
                navAgent.SetDestination(busDoorTransform.position);
                if (animator != null) animator.SetBool("isWalking", true);
            }
        }

        private void OnTriggerEnter(Collider other)
        {
            // When reaching bus door trigger
            if (other.CompareTag("BusDoor") && !isBoarded)
            {
                isBoarded = true;
                if (animator != null) animator.SetBool("isWalking", false);
                gameObject.SetActive(false); // Entered interior
            }
        }
    }
}
