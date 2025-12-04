/**
 * Data Models for Dispatch System
 * 
 * This file contains the data models for Dispatch and DispatchComponent.
 * These models are designed to be reusable across different projects.
 */

/**
 * Dispatch Component Model
 * Represents a single component within a dispatch
 * 
 * @typedef {Object} DispatchComponent
 * @property {number|string} id - Unique identifier for the component
 * @property {string} component_name - Name of the component (e.g., "LVM3 Launch Vehicle Demo Model")
 * @property {number} quantity - Quantity of this component
 * @property {number} unit_cost - Cost per unit
 * @property {number} total_cost - Total cost (quantity * unit_cost)
 * @property {string} expected_delivery_date - Expected delivery date (ISO format)
 * @property {string|null} [remarks] - Optional remarks for this component
 */
export class DispatchComponent {
    constructor({
        id = null,
        component_name,
        quantity,
        unit_cost,
        total_cost = null,
        expected_delivery_date,
        remarks = null,
    }) {
        this.id = id;
        this.component_name = component_name;
        this.quantity = quantity;
        this.unit_cost = unit_cost;
        this.total_cost = total_cost !== null ? total_cost : quantity * unit_cost;
        this.expected_delivery_date = expected_delivery_date;
        this.remarks = remarks;
    }

    /**
     * Calculate total cost
     */
    calculateTotalCost() {
        this.total_cost = this.quantity * this.unit_cost;
        return this.total_cost;
    }

    /**
     * Validate component data
     */
    validate() {
        const errors = [];

        if (!this.component_name || this.component_name.trim() === "") {
            errors.push("Component name is required");
        }

        if (!this.quantity || this.quantity < 1) {
            errors.push("Quantity must be at least 1");
        }

        if (!this.unit_cost || this.unit_cost <= 0) {
            errors.push("Unit cost must be greater than 0");
        }

        // Expected delivery date is optional - no validation needed

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Convert to plain object
     */
    toJSON() {
        return {
            id: this.id,
            component_name: this.component_name,
            quantity: this.quantity,
            unit_cost: this.unit_cost,
            total_cost: this.total_cost,
            expected_delivery_date: this.expected_delivery_date,
            remarks: this.remarks,
        };
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new DispatchComponent(data);
    }
}

/**
 * Dispatch Model
 * Represents a dispatch that can contain multiple components
 * 
 * @typedef {Object} Dispatch
 * @property {number|string} id - Unique identifier for the dispatch
 * @property {number|string} school_id - ID of the school this dispatch belongs to
 * @property {DispatchComponent[]} components - Array of components in this dispatch
 * @property {string} dispatch_date - Date when dispatch was created (ISO format)
 * @property {string} delivery_status - Current delivery status
 * @property {string} installation_status - Current installation status
 * @property {string|null} delivery_proof_url - URL to first delivery proof document (backward compatible)
 * @property {string[]|null} delivery_proof_urls - Array of URLs to all delivery proof documents
 * @property {string|null} installation_proof_url - URL to first installation proof document (backward compatible)
 * @property {string[]|null} installation_proof_urls - Array of URLs to all installation proof documents
 * @property {boolean} is_installed - Whether installation is complete
 * @property {string|null} tracking_number - Tracking number for the dispatch
 * @property {string|null} vendor_name - Name of the vendor
 * @property {string|null} purchase_order - Purchase order number
 * @property {string|null} invoice_number - Invoice number
 * @property {string|null} warranty_period - Warranty period
 * @property {string|null} installation_date - Date of installation (ISO format)
 * @property {string|null} technician_name - Name of the technician
 * @property {string|null} contact_person - Contact person name
 * @property {string|null} contact_phone - Contact phone number
 * @property {string|null} remarks - General remarks for the dispatch
 */
export class Dispatch {
    constructor({
        id = null,
        school_id,
        components = [],
        dispatch_date = new Date().toISOString().split("T")[0],
        delivery_status = "Pending",
        installation_status = "Not Started",
        delivery_proof_url = null,
        delivery_proof_urls = null,
        installation_proof_url = null,
        installation_proof_urls = null,
        is_installed = false,
        tracking_number = null,
        vendor_name = null,
        purchase_order = null,
        invoice_number = null,
        warranty_period = null,
        installation_date = null,
        technician_name = null,
        contact_person = null,
        contact_phone = null,
        remarks = null,
    }) {
        this.id = id;
        this.school_id = school_id;
        this.components = components.map((comp) =>
            comp instanceof DispatchComponent
                ? comp
                : DispatchComponent.fromJSON(comp)
        );
        this.dispatch_date = dispatch_date;
        this.delivery_status = delivery_status;
        this.installation_status = installation_status;
        // Multi-proof support: always keep arrays while maintaining single URL fields
        this.delivery_proof_urls = Array.isArray(delivery_proof_urls)
            ? delivery_proof_urls
            : delivery_proof_url
                ? [delivery_proof_url]
                : [];
        this.installation_proof_urls = Array.isArray(installation_proof_urls)
            ? installation_proof_urls
            : installation_proof_url
                ? [installation_proof_url]
                : [];

        this.delivery_proof_url = this.delivery_proof_urls[0] || null;
        this.installation_proof_url = this.installation_proof_urls[0] || null;
        this.is_installed = is_installed;
        this.tracking_number = tracking_number;
        this.vendor_name = vendor_name;
        this.purchase_order = purchase_order;
        this.invoice_number = invoice_number;
        this.warranty_period = warranty_period;
        this.installation_date = installation_date;
        this.technician_name = technician_name;
        this.contact_person = contact_person;
        this.contact_phone = contact_phone;
        this.remarks = remarks;
    }

    /**
     * Add a component to this dispatch
     */
    addComponent(component) {
        const comp =
            component instanceof DispatchComponent
                ? component
                : DispatchComponent.fromJSON(component);
        this.components.push(comp);
        return comp;
    }

    /**
     * Remove a component from this dispatch
     */
    removeComponent(componentId) {
        this.components = this.components.filter((comp) => comp.id !== componentId);
    }

    /**
     * Get total cost of all components
     */
    getTotalCost() {
        return this.components.reduce(
            (sum, comp) => sum + (comp.total_cost || comp.quantity * comp.unit_cost),
            0
        );
    }

    /**
     * Get total quantity of all components
     */
    getTotalQuantity() {
        return this.components.reduce((sum, comp) => sum + comp.quantity, 0);
    }

    /**
     * Get all component names
     */
    getComponentNames() {
        return this.components.map((comp) => comp.component_name);
    }

    /**
     * Validate dispatch data
     */
    validate() {
        const errors = [];

        if (!this.school_id) {
            errors.push("School ID is required");
        }

        if (!this.components || this.components.length === 0) {
            errors.push("Dispatch must have at least one component");
        } else {
            // Validate each component
            this.components.forEach((comp, index) => {
                const validation = comp.validate();
                if (!validation.isValid) {
                    errors.push(
                        `Component ${index + 1}: ${validation.errors.join(", ")}`
                    );
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors,
        };
    }

    /**
     * Convert to plain object
     */
    toJSON() {
        return {
            id: this.id,
            school_id: this.school_id,
            components: this.components.map((comp) => comp.toJSON()),
            dispatch_date: this.dispatch_date,
            delivery_status: this.delivery_status,
            installation_status: this.installation_status,
            // Multi-proof support
            delivery_proof_url: this.delivery_proof_url,
            delivery_proof_urls: this.delivery_proof_urls,
            installation_proof_url: this.installation_proof_url,
            installation_proof_urls: this.installation_proof_urls,
            is_installed: this.is_installed,
            tracking_number: this.tracking_number,
            vendor_name: this.vendor_name,
            purchase_order: this.purchase_order,
            invoice_number: this.invoice_number,
            warranty_period: this.warranty_period,
            installation_date: this.installation_date,
            technician_name: this.technician_name,
            contact_person: this.contact_person,
            contact_phone: this.contact_phone,
            remarks: this.remarks,
        };
    }

    /**
     * Create from plain object
     */
    static fromJSON(data) {
        return new Dispatch(data);
    }
}

/**
 * Status options for delivery
 */
// export const DELIVERY_STATUS_OPTIONS = [
//     "Pending",
//     "Dispatched",
//     "In Transit",
//     "Out for Delivery",
//     "Delivered",
// ];

/**
 * Status options for installation
 */
// export const INSTALLATION_STATUS_OPTIONS = [
//     "Not Started",
//     "Scheduled",
//     "In Progress",
//     "Completed",
//     "Installed",
// ];

