import frappe
from frappe.patches.v14_0.drop_unused_indexes import drop_index_if_exists


def execute():
	index_fields = ["reference_doctype", "reference_name"]
	index_name = frappe.db.get_index_name(index_fields)
	drop_index_if_exists("tabCommunication", index_name)
