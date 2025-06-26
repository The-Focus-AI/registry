export class ActivityTracker {
  static async startActivity(userId: string, type: string, cost: number): Promise<string> {
    // TODO: Implement start activity
    return ''
  }
  static async completeActivity(activityId: string, actualCost: number): Promise<void> {
    // TODO: Implement complete activity with actual cost
  }
  static async failActivity(activityId: string): Promise<void> {
    // TODO: Implement fail activity
  }
  static async getUserActivities(userId: string): Promise<any[]> {
    // TODO: Implement get user activities
    return []
  }
} 