// 효과음·배경음 재생기. 자동 부트스트랩으로 씬 로드 전에 생기고, GameEvents에 구독해 효과음을 낸다. SFX는 SfxGen으로 생성, BGM은 외부 루프 슬롯.
using System.Collections.Generic;
using UnityEngine;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Presentation
{
    public class AudioManager : MonoBehaviour
    {
        static AudioManager _instance;

        AudioSource _sfx;
        AudioSource _bgm;
        readonly Dictionary<string, AudioClip> _bank = new Dictionary<string, AudioClip>();

        [Range(0f, 1f)] public float sfxVolume = 1f;
        [Range(0f, 1f)] public float bgmVolume = 0.42f;
        public AudioClip bgmClip; // 외부 CC0 루프를 할당하면 우선, 없으면 절차 BGM(BgmGen)으로 폴백

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.BeforeSceneLoad)]
        static void Bootstrap()
        {
            if (_instance != null) return;
            var go = new GameObject("AudioManager");
            DontDestroyOnLoad(go);
            go.AddComponent<AudioManager>();
        }

        void Awake()
        {
            if (_instance != null && _instance != this) { Destroy(gameObject); return; }
            _instance = this;

            _sfx = gameObject.AddComponent<AudioSource>();
            _sfx.playOnAwake = false;
            _bgm = gameObject.AddComponent<AudioSource>();
            _bgm.loop = true;
            _bgm.playOnAwake = false;

            BuildBank();
            Subscribe();
            if (bgmClip == null) bgmClip = BgmGen.LoopTrack(); // 절차 cozy 루프 — 외부 에셋 블로커 우회 (feat-004)
            if (bgmClip != null) PlayBgm(bgmClip);
        }

        void OnDestroy()
        {
            if (_instance == this) Unsubscribe();
        }

        void BuildBank()
        {
            _bank["blip"] = SfxGen.Blip();
            _bank["coin"] = SfxGen.Coin();
            _bank["powerup"] = SfxGen.Powerup();
            _bank["denied"] = SfxGen.Denied();
            _bank["tick"] = SfxGen.Tick();
            _bank["fanfare"] = SfxGen.Fanfare();
            _bank["stinger"] = SfxGen.Stinger();
        }

        public void Play(string key)
        {
            if (_sfx != null && _bank.TryGetValue(key, out var clip) && clip != null)
                _sfx.PlayOneShot(clip, sfxVolume);
        }

        public void PlayBgm(AudioClip clip)
        {
            if (_bgm == null || clip == null) return;
            _bgm.clip = clip;
            _bgm.volume = bgmVolume;
            _bgm.Play();
        }

        // UI 등 외부에서 효과음을 내는 정적 진입점.
        public static void Sfx(string key)
        {
            if (_instance != null) _instance.Play(key);
        }

        void Subscribe()
        {
            GameEvents.ProductLaunched += OnProductLaunched;
            GameEvents.CapabilityUpgraded += OnCapabilityUpgraded;
            GameEvents.CompanyStageChanged += OnStageChanged;
            GameEvents.DomainUnlocked += OnDomainUnlocked;
            GameEvents.MonthAdvanced += OnMonthAdvanced;
        }

        void Unsubscribe()
        {
            GameEvents.ProductLaunched -= OnProductLaunched;
            GameEvents.CapabilityUpgraded -= OnCapabilityUpgraded;
            GameEvents.CompanyStageChanged -= OnStageChanged;
            GameEvents.DomainUnlocked -= OnDomainUnlocked;
            GameEvents.MonthAdvanced -= OnMonthAdvanced;
        }

        void OnProductLaunched(string id) => Play("fanfare");
        void OnCapabilityUpgraded(string id, int level) => Play("powerup");
        void OnStageChanged(string id) => Play("stinger");
        void OnDomainUnlocked(string id) => Play("powerup");
        void OnMonthAdvanced(int month) => Play("tick");
    }
}
