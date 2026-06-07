// 런타임 상태 세이브/로드 (Godot SaveManager.gd 대응). GameModel <-> JSON, persistentDataPath.
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using AICompanyTycoon.Core;

namespace AICompanyTycoon.Save
{
    public class SaveService
    {
        readonly string _path;

        public SaveService(string path = null)
        {
            _path = string.IsNullOrEmpty(path)
                ? Path.Combine(Application.persistentDataPath, "savegame.json")
                : path;
        }

        public string SavePath => _path;
        public bool HasSave() => File.Exists(_path);
        public void Delete() { if (File.Exists(_path)) File.Delete(_path); }

        public void Save(GameModel m)
        {
            File.WriteAllText(_path, JsonUtility.ToJson(ToData(m), true));
        }

        public bool Load(GameModel into)
        {
            if (!File.Exists(_path)) return false;
            var d = JsonUtility.FromJson<SaveData>(File.ReadAllText(_path));
            if (d == null) return false;
            Apply(d, into);
            return true;
        }

        static SaveData ToData(GameModel m)
        {
            var d = new SaveData
            {
                cash = m.Cash, users = m.Users, compute = m.Compute, data = m.Data,
                talent = m.Talent, trust = m.Trust, hype = m.Hype, automation = m.Automation,
                currentMonth = m.CurrentMonth, companyStageId = m.CompanyStageId,
                unlockedDomains = new List<string>(m.UnlockedDomains),
                activeProducts = new List<string>(m.ActiveProducts),
                purchasedUpgrades = new List<string>(m.PurchasedUpgrades),
                purchasedAutomation = new List<string>(m.PurchasedAutomation),
                triggeredEvents = new List<string>(m.TriggeredEvents),
            };
            foreach (var kv in m.Capabilities)
                d.capabilities.Add(new CapEntry { id = kv.Key, level = kv.Value });
            return d;
        }

        static void Apply(SaveData d, GameModel m)
        {
            m.Cash = d.cash; m.Users = d.users; m.Compute = d.compute; m.Data = d.data;
            m.Talent = d.talent; m.Trust = d.trust; m.Hype = d.hype; m.Automation = d.automation;
            m.CurrentMonth = d.currentMonth; m.CompanyStageId = d.companyStageId;
            m.UnlockedDomains = new List<string>(d.unlockedDomains ?? new List<string>());
            m.ActiveProducts = new List<string>(d.activeProducts ?? new List<string>());
            m.PurchasedUpgrades = new List<string>(d.purchasedUpgrades ?? new List<string>());
            m.PurchasedAutomation = new List<string>(d.purchasedAutomation ?? new List<string>());
            m.TriggeredEvents = new List<string>(d.triggeredEvents ?? new List<string>());
            m.Capabilities = new Dictionary<string, int>();
            if (d.capabilities != null)
                foreach (var c in d.capabilities) m.Capabilities[c.id] = c.level;
        }
    }
}
