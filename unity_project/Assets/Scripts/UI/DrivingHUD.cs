using UnityEngine;
using UnityEngine.UI;
using TamilNaduBusSim.Vehicles;

namespace TamilNaduBusSim.UI
{
    /// <summary>
    /// In-game driving HUD for Unity
    /// Updates digital speedometer, gear text, fuel gauge, damage bar and notifications.
    /// </summary>
    public class DrivingHUD : MonoBehaviour
    {
        [SerializeField] private BusController busController;

        [Header("UI Text Fields")]
        [SerializeField] private Text speedText;
        [SerializeField] private Text gearText;
        [SerializeField] private Text passengerCountText;
        [SerializeField] private Text notificationBannerText;

        [Header("UI Sliders")]
        [SerializeField] private Slider fuelSlider;
        [SerializeField] private Slider healthSlider;

        private void Update()
        {
            if (busController == null) return;

            // 1. Digital Speedometer
            if (speedText != null)
            {
                speedText.text = Mathf.RoundToInt(busController.CurrentSpeedKmh).ToString();
            }

            // 2. Gear Display
            if (gearText != null)
            {
                if (busController.IsReverse) gearText.text = "R";
                else if (busController.CurrentSpeedKmh < 1f && busController.ThrottleInput == 0) gearText.text = "N";
                else gearText.text = busController.CurrentGear.ToString();
            }
        }

        public void DisplayNotification(string message, float durationSeconds = 3f)
        {
            if (notificationBannerText == null) return;
            notificationBannerText.text = message;
            notificationBannerText.gameObject.SetActive(true);
            CancelInvoke(nameof(HideNotification));
            Invoke(nameof(HideNotification), durationSeconds);
        }

        private void HideNotification()
        {
            if (notificationBannerText != null)
            {
                notificationBannerText.gameObject.SetActive(false);
            }
        }
    }
}
