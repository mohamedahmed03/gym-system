import { Component, OnInit } from '@angular/core';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-reports',
  imports: [],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports implements OnInit {
  reportsData: any = null;
  loading = true;
  errorMsg = '';
  memberId = '123'; // مؤقتاً، هنستبدله بالـ ID الحقيقي بعدين

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.reportsService.getReports().subscribe({
      next: (data) => {
        this.reportsData = data;
        this.loading = false;
        console.log('Reports data:', data);
      },
      error: (err) => {
        this.errorMsg = 'Failed to load reports data';
        this.loading = false;
        console.error(err);
      },
    });
  }

  openPrintableReport(): void {
    window.open(this.reportsService.getPrintUrl(this.memberId), '_blank');
  }
}