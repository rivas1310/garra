// API Client para comunicación con el servidor web
class APIClient {
    constructor() {
        this.baseURL = 'https://www.garrasfelinas.com';
        this.authToken = null;
        this.isConnected = false;
        this.connectionCheckInterval = null;
    }

    // Inicializar el cliente API
    async initialize() {
        try {
            // Obtener configuración desde Electron
            if (window.electronAPI) {
                this.baseURL = await window.electronAPI.getApiUrl();
                this.authToken = await window.electronAPI.getAuthToken();
            }
            
            // Marcar como inicializado inmediatamente
            this.isConnected = true; // Asumir conexión para no bloquear
            
            // Verificar conexión real en segundo plano (no bloquear)
            setTimeout(() => {
                this.checkConnection().catch(error => {
                    console.log('Error verificando conexión:', error);
                });
            }, 2000);
            
            // Iniciar verificación periódica de conexión
            this.startConnectionCheck();
            
            return true;
        } catch (error) {
            console.error('Error inicializando API client:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Verificar conexión con el servidor
    async checkConnection() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout
            
            const response = await fetch(`${this.baseURL}/api/test-connection`, {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            this.isConnected = response.ok;
            this.updateConnectionStatus();
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            this.updateConnectionStatus();
            console.log('Error de conexión:', error.message);
            return false;
        }
    }

    // Iniciar verificación periódica de conexión
    startConnectionCheck() {
        if (this.connectionCheckInterval) {
            clearInterval(this.connectionCheckInterval);
        }
        
        this.connectionCheckInterval = setInterval(() => {
            this.checkConnection();
        }, 30000); // Verificar cada 30 segundos
    }

    // Actualizar indicador de estado de conexión
    updateConnectionStatus() {
        const indicator = document.getElementById('connection-indicator');
        const text = document.getElementById('connection-text');
        
        if (indicator && text) {
            if (this.isConnected) {
                indicator.className = 'status-indicator online';
                text.textContent = 'Conectado';
            } else {
                indicator.className = 'status-indicator offline';
                text.textContent = 'Desconectado';
            }
        }
    }

    // Configurar URL base
    async setBaseURL(url) {
        this.baseURL = url;
        if (window.electronAPI) {
            await window.electronAPI.setApiUrl(url);
        }
        await this.checkConnection();
    }

    // Configurar token de autenticación
    async setAuthToken(token) {
        this.authToken = token;
        if (window.electronAPI) {
            await window.electronAPI.setAuthToken(token);
        }
    }

    // Limpiar autenticación
    async clearAuth() {
        this.authToken = null;
        if (window.electronAPI) {
            await window.electronAPI.clearAuth();
        }
    }

    // Realizar petición HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Agregar token de autenticación si existe
        if (this.authToken) {
            config.headers['Authorization'] = `Bearer ${this.authToken}`;
        }

        try {
            const response = await fetch(url, config);
            
            // Si la respuesta no es exitosa, lanzar error
            if (!response.ok) {
                if (response.status === 401) {
                    // Token expirado o inválido
                    await this.clearAuth();
                    window.location.reload();
                    throw new Error('Sesión expirada');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Intentar parsear JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Métodos de autenticación
    async login(email, password) {
        const response = await this.request('/api/auth/signin', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (response.token) {
            await this.setAuthToken(response.token);
        }
        
        return response;
    }

    async logout() {
        try {
            await this.request('/api/auth/signout', { method: 'POST' });
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            await this.clearAuth();
        }
    }

    // Métodos de productos
    async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/productos?${queryString}`);
    }

    async getProduct(id) {
        return await this.request(`/api/productos/${id}`);
    }

    async createProduct(productData) {
        return await this.request('/api/productos', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return await this.request(`/api/productos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return await this.request(`/api/productos/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos de pedidos
    async getOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/pedidos?${queryString}`);
    }

    async getOrder(id) {
        return await this.request(`/api/pedidos/${id}`);
    }

    async updateOrderStatus(id, status) {
        return await this.request(`/api/pedidos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Métodos de clientes
    async getCustomers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/admin/users?${queryString}`);
    }

    async getCustomer(id) {
        return await this.request(`/api/admin/users/${id}`);
    }

    // Métodos de cupones
    async getCoupons() {
        return await this.request('/api/cupones');
    }

    async createCoupon(couponData) {
        return await this.request('/api/cupones', {
            method: 'POST',
            body: JSON.stringify(couponData)
        });
    }

    async updateCoupon(id, couponData) {
        return await this.request(`/api/cupones/${id}`, {
            method: 'PUT',
            body: JSON.stringify(couponData)
        });
    }

    async deleteCoupon(id) {
        return await this.request(`/api/cupones/${id}`, {
            method: 'DELETE'
        });
    }

    // Métodos de categorías
    async getCategories() {
        return await this.request('/api/categorias');
    }

    // Métodos de inventario
    async getInventory() {
        return await this.request('/api/admin/inventory');
    }

    async updateStock(productId, stock) {
        return await this.request(`/api/productos/${productId}/stock`, {
            method: 'PUT',
            body: JSON.stringify({ stock })
        });
    }

    // Métodos de reportes
    async getDashboardStats() {
        return await this.request('/api/admin/reports/dashboard');
    }

    async getSalesReport(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await this.request(`/api/admin/reports/sales?${queryString}`);
    }

    // Métodos de exportación
    async exportData(type, format = 'csv') {
        return await this.request(`/api/admin/export/${type}?format=${format}`, {
            method: 'GET'
        });
    }

    // Métodos de importación
    async importProducts(file) {
        const formData = new FormData();
        formData.append('file', file);
        
        return await this.request('/api/productos-bulk-v2', {
            method: 'POST',
            headers: {}, // No establecer Content-Type para FormData
            body: formData
        });
    }

    // Métodos de configuración
    async getSettings() {
        return await this.request('/api/admin/settings');
    }

    async updateSettings(settings) {
        return await this.request('/api/admin/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }
}

// Instancia global del cliente API
window.apiClient = new APIClient();

