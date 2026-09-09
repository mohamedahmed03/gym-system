import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  memberData: any = null;
  loading = true;
  errorMsg = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getDashboard().subscribe({
      next: (data) => {
        this.memberData = data;
        this.loading = false;
        console.log('Dashboard data:', data);
      },
      error: (err) => {
        this.errorMsg = 'Failed to load dashboard data';
        this.loading = false;
        console.error(err);
      },
    });
  }
}