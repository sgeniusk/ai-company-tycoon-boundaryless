# GameState.gd
# Central game state singleton. Single source of truth for all runtime data.
# Autoload singleton: GameState
#
# Responsible for:
# - Storing all runtime resource values
# - Tracking current month
# - Tracking company stage
# - Tracking unlocked domains, capabilities, products, upgrades
# - Providing read access to all state
# - Delegating mutations to appropriate systems

extends Node


# === Current Resources ===
var cash: float = 0.0
var users: float = 0.0
var compute: float = 0.0
var data: float = 0.0
var talent: float = 0.0
var trust: float = 0.0
var hype: float = 0.0
var automation: float = 0.0

# === Game Progress ===
var current_month: int = 1
var company_stage: String = "Garage Prototype"

# === Unlocks (for future milestones) ===
var unlocked_domains: Array[String] = []
var unlocked_capabilities: Dictionary = {}  # capability_id -> level
var active_products: Array[String] = []
var purchased_upgrades: Array[String] = []

# === Flags ===
var flags: Dictionary = {}

# === Resource metadata (loaded from JSON) ===
var _resource_config: Dictionary = {}

# === Company Stages ===
var COMPANY_STAGES: Array[String] = [
	"Garage Prototype",
	"Seed Startup",
	"Viral App Company",
	"Enterprise AI Vendor",
	"AI Platform Giant",
	"Boundaryless Intelligence Company"
]


func _ready() -> void:
	_initialize_from_data()
	EventBus.game_started.emit()


func _initialize_from_data() -> void:
	"""Load initial resource values from data files."""
	_resource_config = DataLoader.load_resources()
	
	if _resource_config.is_empty():
		push_error("[GameState] Failed to load resources. Using hardcoded defaults.")
		_apply_fallback_defaults()
		return
	
	# Set initial values from JSON
	cash = _get_initial_value("cash", 10000.0)
	users = _get_initial_value("users", 0.0)
	compute = _get_initial_value("compute", 100.0)
	data = _get_initial_value("data", 50.0)
	talent = _get_initial_value("talent", 3.0)
	trust = _get_initial_value("trust", 50.0)
	hype = _get_initial_value("hype", 10.0)
	automation = _get_initial_value("automation", 0.0)
	
	# Initialize unlocks
	unlocked_domains = ["personal_productivity"]
	current_month = 1
	company_stage = COMPANY_STAGES[0]


func _get_initial_value(resource_id: String, fallback: float) -> float:
	"""Get initial value for a resource from config."""
	if _resource_config.has(resource_id) and _resource_config[resource_id].has("initial_value"):
		return float(_resource_config[resource_id]["initial_value"])
	push_warning("[GameState] No initial_value for '%s'. Using fallback: %s" % [resource_id, str(fallback)])
	return fallback


func _apply_fallback_defaults() -> void:
	"""Apply hardcoded defaults if data loading fails."""
	cash = 10000.0
	users = 0.0
	compute = 100.0
	data = 50.0
	talent = 3.0
	trust = 50.0
	hype = 10.0
	automation = 0.0


# === Getters ===

func get_resource(resource_id: String) -> float:
	"""Get current value of a resource by ID."""
	match resource_id:
		"cash": return cash
		"users": return users
		"compute": return compute
		"data": return data
		"talent": return talent
		"trust": return trust
		"hype": return hype
		"automation": return automation
		_:
			push_warning("[GameState] Unknown resource: %s" % resource_id)
			return 0.0


func get_all_resources() -> Dictionary:
	"""Get all current resource values as a dictionary."""
	return {
		"cash": cash,
		"users": users,
		"compute": compute,
		"data": data,
		"talent": talent,
		"trust": trust,
		"hype": hype,
		"automation": automation,
	}


func get_resource_config() -> Dictionary:
	"""Get the resource configuration loaded from JSON."""
	return _resource_config


# === State Management ===

func reset_game() -> void:
	"""Reset all state to initial values for a new game."""
	DataLoader.clear_cache()
	_initialize_from_data()
	active_products.clear()
	purchased_upgrades.clear()
	flags.clear()
	EventBus.game_started.emit()
	EventBus.resources_updated.emit()
