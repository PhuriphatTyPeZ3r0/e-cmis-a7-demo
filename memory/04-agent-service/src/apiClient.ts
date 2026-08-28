export class EcmisApiClient {
  private baseUrl: string;
  private jwtToken: string | null = null;

  constructor(baseUrl = "http://localhost:5000/api") {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.jwtToken = token;
  }

  // Mock checking appointments
  async getAppointments(date: string) {
    console.log(`[E-CMIS API] Fetching appointments for ${date} with token ${this.jwtToken ? 'provided' : 'missing'}`);
    return [
      { id: '1', time: '09:00', patient: 'John Doe', status: 'confirmed' },
      { id: '2', time: '14:00', patient: 'Jane Smith', status: 'pending' }
    ];
  }

  // Mock booking an appointment
  async createAppointment(date: string, time: string, reason: string) {
    console.log(`[E-CMIS API] Creating appointment on ${date} at ${time} for ${reason}`);
    return { success: true, id: Math.random().toString(36).substr(2, 9), status: 'pending_approval' };
  }
}
