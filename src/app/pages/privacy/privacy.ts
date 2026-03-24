import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css',
})
export class Privacy implements OnInit, OnDestroy {

  // ── Hide navbar — this is a standalone policy page ─────────
  ngOnInit(): void {
    document.body.classList.add('no-navbar');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-navbar');
  }
}