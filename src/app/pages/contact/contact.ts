import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {

  // Form fields
  fname = '';
  lname = '';
  email = '';
  subject = '';
  message = '';

  // UI state
  charCount = 0;
  formError = '';
  isLoading = false;
  isSuccess = false;

  // FAQ open state
  openFaqIndex: number | null = null;

  faqs = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping within Metro Manila takes 1–3 business days. Provincial orders typically take 3–7 business days depending on your area. You\'ll get a tracking number once your order ships.'
    },
    {
      question: 'Can I return or exchange an item?',
      answer: 'We accept returns within 7 days for items that arrive significantly different from their listing. Items are ukay-ukay so minor wear is expected — please read descriptions carefully before purchasing.'
    },
    {
      question: 'Are all items authentic finds?',
      answer: 'Yes — every item is handpicked and verified by our team before listing. We don\'t post replicas or misrepresented pieces. What you see is what you get, for real.'
    },
    {
      question: 'How do I sell on ThriftHub?',
      answer: 'Create a free account and apply to become a verified seller. Once approved, you can list items directly from your dashboard. We handle payments and you handle shipping — simple as that.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept GCash, Maya, major credit/debit cards (Visa, Mastercard), and bank transfers. COD is available in select Metro Manila areas.'
    },
    {
      question: 'I have an urgent issue — who do I call?',
      answer: 'For urgent matters, Viber or call us at +63 917 123 4567 between 9AM–6PM PHT, Monday to Saturday. You can also DM us on Instagram for a fast response.'
    }
  ];

  onMessageInput(): void {
    this.charCount = this.message.length;
  }

  toggleFaq(index: number): void {
    this.openFaqIndex = this.openFaqIndex === index ? null : index;
  }

  isFaqOpen(index: number): boolean {
    return this.openFaqIndex === index;
  }

  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  handleSubmit(): void {
    this.formError = '';

    if (!this.fname.trim() || !this.lname.trim()) {
      this.formError = '⚠ Please enter your full name.';
      return;
    }
    if (!this.email.trim() || !this.isValidEmail(this.email)) {
      this.formError = '⚠ Please enter a valid email address.';
      return;
    }
    if (!this.subject) {
      this.formError = '⚠ Please select a topic.';
      return;
    }
    if (!this.message.trim() || this.message.trim().length < 10) {
      this.formError = '⚠ Message too short — give us more to work with.';
      return;
    }

    this.isLoading = true;

    // Simulate async send — replace with real HTTP call
    setTimeout(() => {
      this.isLoading = false;
      this.isSuccess = true;
    }, 1800);
  }

  resetForm(): void {
    this.fname = '';
    this.lname = '';
    this.email = '';
    this.subject = '';
    this.message = '';
    this.charCount = 0;
    this.formError = '';
    this.isSuccess = false;
  }
}