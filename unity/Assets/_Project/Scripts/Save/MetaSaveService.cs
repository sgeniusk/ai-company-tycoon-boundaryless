// 크로스런 메타 도감 세이브 — 발견한 아키타입/엔딩 id가 런을 넘어 쌓인다 (feat-008 #2/#3, React roguelite 대응).
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace AICompanyTycoon.Save
{
    [System.Serializable]
    public class MetaData
    {
        public int version = 1;
        public List<string> discoveredArchetypeIds = new List<string>();
        public List<string> discoveredEndingIds = new List<string>();
    }

    public class MetaSaveService
    {
        readonly string _path;
        MetaData _data;

        public MetaSaveService(string path = null)
        {
            _path = string.IsNullOrEmpty(path)
                ? Path.Combine(Application.persistentDataPath, "meta.json")
                : path;
        }

        public MetaData Data
        {
            get
            {
                if (_data == null) Load();
                return _data;
            }
        }

        public void Load()
        {
            _data = null;
            if (File.Exists(_path))
            {
                _data = JsonUtility.FromJson<MetaData>(File.ReadAllText(_path));
            }
            if (_data == null) _data = new MetaData();
            _data.discoveredArchetypeIds = _data.discoveredArchetypeIds ?? new List<string>();
            _data.discoveredEndingIds = _data.discoveredEndingIds ?? new List<string>();
        }

        public void Save()
        {
            if (_data == null) return;
            File.WriteAllText(_path, JsonUtility.ToJson(_data, true));
        }

        // 신규 항목만 추가하고 즉시 저장. 추가된 개수를 돌려준다.
        public int RecordArchetypes(IEnumerable<string> ids)
        {
            return Record(Data.discoveredArchetypeIds, ids);
        }

        public int RecordEnding(string id)
        {
            return Record(Data.discoveredEndingIds, new[] { id });
        }

        int Record(List<string> target, IEnumerable<string> ids)
        {
            int added = 0;
            foreach (var id in ids)
            {
                if (string.IsNullOrEmpty(id) || target.Contains(id)) continue;
                target.Add(id);
                added += 1;
            }
            if (added > 0) Save();
            return added;
        }

        public void Delete()
        {
            _data = null;
            if (File.Exists(_path)) File.Delete(_path);
        }
    }
}
