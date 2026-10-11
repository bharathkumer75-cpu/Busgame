using UnityEngine;

namespace TamilNaduBusSim.Environment
{
    public enum WeatherType
    {
        Clear,
        MonsoonRain,
        FoggyGhat
    }

    /// <summary>
    /// Dynamic weather controller for tropical Tamil Nadu rainstorms and Nilgiris mist.
    /// Controls particle systems, road wetness shaders, and thunder audio.
    /// </summary>
    public class WeatherManager : MonoBehaviour
    {
        [Header("Weather Systems")]
        [SerializeField] private ParticleSystem rainParticleSystem;
        [SerializeField] private AudioSource rainAudioSource;
        [SerializeField] private Material roadAsphaltMaterial;

        [Header("Fog Settings")]
        [SerializeField] private float clearFogDensity = 0.002f;
        [SerializeField] private float mistyFogDensity = 0.015f;

        public WeatherType currentWeather = WeatherType.Clear;

        private void Start()
        {
            ApplyWeather(currentWeather);
        }

        public void ApplyWeather(WeatherType type)
        {
            currentWeather = type;

            switch (type)
            {
                case WeatherType.Clear:
                    if (rainParticleSystem != null) rainParticleSystem.Stop();
                    if (rainAudioSource != null) rainAudioSource.Stop();
                    RenderSettings.fogDensity = clearFogDensity;
                    SetRoadWetness(0.0f);
                    break;

                case WeatherType.MonsoonRain:
                    if (rainParticleSystem != null) rainParticleSystem.Play();
                    if (rainAudioSource != null) rainAudioSource.Play();
                    RenderSettings.fogDensity = 0.006f;
                    SetRoadWetness(0.85f);
                    break;

                case WeatherType.FoggyGhat:
                    if (rainParticleSystem != null) rainParticleSystem.Stop();
                    if (rainAudioSource != null) rainAudioSource.Stop();
                    RenderSettings.fogDensity = mistyFogDensity;
                    SetRoadWetness(0.2f);
                    break;
            }
        }

        private void SetRoadWetness(float wetness)
        {
            if (roadAsphaltMaterial != null && roadAsphaltMaterial.HasProperty("_Smoothness"))
            {
                roadAsphaltMaterial.SetFloat("_Smoothness", wetness);
            }
        }
    }
}
