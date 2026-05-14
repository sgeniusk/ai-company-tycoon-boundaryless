# DomainSystem.gd
# Manages domain unlocking and market information.
# Autoload singleton: DomainSystem

extends Node

## All domain definitions
var all_domains: Array[Dictionary] = []


func _ready() -> void:
	_load_domains()
	_initialize_starting_domains()


func _load_domains() -> void:
	"""Load domain definitions from JSON."""
	var data = DataLoader.load_json("res://data/domains.json")
	if data == null or not data.has("domains"):
		push_error("[DomainSystem] Failed to load domains.json")
		return
	all_domains.clear()
	for d in data["domains"]:
		all_domains.append(d)


func _initialize_starting_domains() -> void:
	"""Unlock domains that are unlocked by default."""
	for domain in all_domains:
		if domain.get("unlocked_by_default", false):
			if not GameState.unlocked_domains.has(domain["id"]):
				GameState.unlocked_domains.append(domain["id"])


func get_all_domains() -> Array[Dictionary]:
	return all_domains


func is_unlocked(domain_id: String) -> bool:
	return GameState.unlocked_domains.has(domain_id)


func get_unlock_requirements(domain_id: String) -> Dictionary:
	"""Get the capability requirements to unlock a domain."""
	var domain = _get_domain(domain_id)
	return domain.get("unlock_requirements", {})


func get_lock_reason(domain_id: String) -> String:
	"""Return human-readable reason why domain is locked."""
	var domain = _get_domain(domain_id)
	if domain.is_empty():
		return "Domain not found."
	if is_unlocked(domain_id):
		return "Already unlocked."
	
	var reqs = domain.get("unlock_requirements", {})
	var reasons: Array[String] = []
	for cap_id in reqs:
		var required = int(reqs[cap_id])
		var current = CapabilitySystem.get_capability_level(cap_id)
		if current < required:
			reasons.append("Need %s Lv.%d (have Lv.%d)" % [cap_id.capitalize(), required, current])
	
	if reasons.is_empty():
		return "Ready to unlock!"
	return "; ".join(reasons)


func try_unlock_domain(domain_id: String) -> bool:
	"""Try to unlock a domain. Returns true if newly unlocked."""
	if is_unlocked(domain_id):
		return false
	
	var domain = _get_domain(domain_id)
	if domain.is_empty():
		return false
	
	# Check requirements
	var reqs = domain.get("unlock_requirements", {})
	for cap_id in reqs:
		var required = int(reqs[cap_id])
		var current = CapabilitySystem.get_capability_level(cap_id)
		if current < required:
			return false
	
	# Unlock
	GameState.unlocked_domains.append(domain_id)
	EventBus.domain_unlocked.emit(domain_id)
	EventBus.log_message.emit("New domain unlocked: %s!" % domain.get("name", domain_id))
	return true


func check_all_domain_unlocks() -> void:
	"""Check if any domains can be unlocked with current capabilities."""
	for domain in all_domains:
		if not is_unlocked(domain["id"]):
			try_unlock_domain(domain["id"])


func _get_domain(domain_id: String) -> Dictionary:
	for domain in all_domains:
		if domain["id"] == domain_id:
			return domain
	return {}
