import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../shared/components/toast/service/toast.service';
import { OnboardingRequest, KikDocument } from '../../core/models/kikevent.models';

@Component({ selector: 'app-validations', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './validations.html', styleUrls: ['./validations.scss'] })
export class ValidationsComponent implements OnInit {
  protected svc   = inject(AdminService);
  protected toast = inject(ToastService);
  all: OnboardingRequest[] = [];
  requests: OnboardingRequest[] = [];
  loading = false;
  activeTab: 'PENDING'|'APPROVED'|'REJECTED' = 'PENDING';
  selected: OnboardingRequest | null = null;
  showPanel = false; showReject = false; rejectMotif = ''; rejectTarget: OnboardingRequest | null = null;
  tabs = [{key:'PENDING',label:'En attente',count:0},{key:'APPROVED',label:'Approuvées',count:0},{key:'REJECTED',label:'Rejetées',count:0}];

  ngOnInit(): void { this.loadAll(); }
  loadAll(): void {
    this.loading = true;
    this.svc.getOnboardingRequests().subscribe({
      next: r => { this.all = r.data?.content ?? r.data ?? this.mock(); this.refresh(); },
      error: () => { this.all = this.mock(); this.refresh(); this.loading = false; },
      complete: () => { this.loading = false; }
    });
  }
  refresh(): void {
    this.tabs[0].count = this.all.filter(x => x.statut==='PENDING').length;
    this.tabs[1].count = this.all.filter(x => x.statut==='APPROVED').length;
    this.tabs[2].count = this.all.filter(x => x.statut==='REJECTED').length;
    this.requests = this.all.filter(r => r.statut === this.activeTab);
  }
  setTab(t: {key:string}): void { this.activeTab = t.key as any; this.refresh(); }
  openDetail(r: OnboardingRequest): void { this.selected = r; this.showPanel = true; }
  approve(r: OnboardingRequest): void {
    this.svc.approveOnboarding(r.id).subscribe({
      next: () => { this.toast.show('success', `Demande de ${r.userName} approuvée !`); this.showPanel = false; this.loadAll(); },
      error: () => { this.toast.show('error', "Erreur approbation"); }
    });
  }
  openReject(r: OnboardingRequest): void { this.rejectTarget = r; this.rejectMotif = ''; this.showReject = true; }
  confirmReject(): void {
    if (!this.rejectTarget || !this.rejectMotif.trim()) { return; }
    this.svc.rejectOnboarding(this.rejectTarget.id, this.rejectMotif).subscribe({
      next: () => { this.toast.show('info', `Demande rejetée. ${this.rejectTarget!.userName} notifié.`); this.showReject = false; this.showPanel = false; this.loadAll(); },
      error: () => { this.toast.show('error', 'Erreur rejet'); }
    });
  }
  docLabel(t: string): string {
    const m: Record<string,string> = {CNI:"CNI",REGISTRE_COMMERCE:"RC",STATUTS:"Statuts",AUTRE:"Autre"};
    return m[t] ?? t;
  }
  private mock(): OnboardingRequest[] {
    return [
      {id:1,userId:10,userName:'Kamga Events SARL',userEmail:'kamga@cm',userPhone:'655123456',roleDemande:'ORGANIZER',statut:'PENDING',documents:[{id:1,nom:'CNI_Kamga.pdf',type:'CNI',url:'#',uploadedAt:'2025-04-01'},{id:2,nom:'RC.pdf',type:'REGISTRE_COMMERCE',url:'#',uploadedAt:'2025-04-01'}],createdAt:'2025-04-01',nomOrganisation:'Kamga Events SARL',typeOrganisation:'Société'},
      {id:2,userId:11,userName:'Jean Photios',userEmail:'jphotios@cm',userPhone:'677456789',roleDemande:'CONTROLER',statut:'PENDING',documents:[{id:3,nom:'CNI_Jean.pdf',type:'CNI',url:'#',uploadedAt:'2025-04-02'}],createdAt:'2025-04-02'},
      {id:3,userId:12,userName:'Yannick Prod',userEmail:'yannick@cm',roleDemande:'ORGANIZER',statut:'APPROVED',documents:[{id:4,nom:'CNI.pdf',type:'CNI',url:'#',uploadedAt:'2025-03-15'}],createdAt:'2025-03-15',nomOrganisation:'Yannick Production'},
      {id:4,userId:13,userName:'Fake Company',userEmail:'fake@bad.cm',roleDemande:'ORGANIZER',statut:'REJECTED',documents:[],createdAt:'2025-03-10',motifRejet:'Documents invalides - CNI expirée'},
    ];
  }
}