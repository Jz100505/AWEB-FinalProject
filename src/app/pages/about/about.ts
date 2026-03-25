import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit, AfterViewInit, OnDestroy {

  private counterObserver?: IntersectionObserver;
  private countersAnimated = false;

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initCounterObserver();
  }

  ngOnDestroy(): void {
    this.counterObserver?.disconnect();
  }

  // ── Animate metric counters when section scrolls into view ──────
  private initCounterObserver(): void {
    const metricsSection = document.querySelector('.ab-metrics-grid');
    if (!metricsSection) return;

    this.counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.countersAnimated) {
            this.countersAnimated = true;
            this.animateAllCounters();
          }
        });
      },
      { threshold: 0.25 }
    );

    this.counterObserver.observe(metricsSection);
  }

  private animateAllCounters(): void {
    const counterEls = document.querySelectorAll<HTMLElement>('[data-counter]');
    counterEls.forEach(el => {
      const target = parseInt(el.textContent ?? '0', 10);
      this.animateCounter(el, 0, target, 1800);
    });
  }

  private animateCounter(
    el: HTMLElement,
    start: number,
    end: number,
    duration: number
  ): void {
    const startTime = performance.now();

    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current.toLocaleString('en-PH');
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
}