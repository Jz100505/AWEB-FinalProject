import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './terms.html',
  styleUrl: './terms.css',
})
export class Terms implements OnInit, OnDestroy {

  // ── Hide navbar — this is a standalone policy page ─────────
  ngOnInit(): void {
    document.body.classList.add('no-navbar');
  }

  ngOnDestroy(): void {
    document.body.classList.remove('no-navbar');
  }
}