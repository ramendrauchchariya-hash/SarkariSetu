/**
 * Validation logic for the Jobs CMS form.
 * Separated from admin-actions.ts because validateJobForm is synchronous
 * and cannot live in a 'use server' file.
 */

import { slugify } from './slug';
import type { JobFormData } from './admin-actions';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidUrl(url: string): boolean {
  if (!url) return true;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateJobForm(data: JobFormData, forPublish = false): ValidationResult {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push('Job Title is required.');
  }
  if (!data.organization_id) {
    errors.push('Organization is required.');
  }
  if (!data.slug?.trim()) {
    errors.push('Slug is required.');
  }
  if (!slugify(data.slug)) {
    errors.push('Slug must contain at least one alphanumeric character.');
  }

  if (data.official_notification_url && !isValidUrl(data.official_notification_url)) {
    errors.push('Official Notification URL is not a valid URL.');
  }
  if (data.official_application_url && !isValidUrl(data.official_application_url)) {
    errors.push('Official Application URL is not a valid URL.');
  }
  if (data.official_website_url && !isValidUrl(data.official_website_url)) {
    errors.push('Official Website URL is not a valid URL.');
  }

  if (data.application_start && data.application_end) {
    if (new Date(data.application_end) < new Date(data.application_start)) {
      errors.push('Application End date cannot be before Application Start date.');
    }
  }

  data.posts.forEach((post, i) => {
    if (post.age_min && post.age_max) {
      const min = parseInt(post.age_min, 10);
      const max = parseInt(post.age_max, 10);
      if (min > max) {
        errors.push(`Post ${i + 1}: Minimum age cannot be greater than maximum age.`);
      }
    }
    if (post.salary_min && post.salary_max) {
      const min = parseInt(post.salary_min, 10);
      const max = parseInt(post.salary_max, 10);
      if (min > max) {
        errors.push(`Post ${i + 1}: Minimum salary cannot be greater than maximum salary.`);
      }
    }
  });

  data.vacancies.forEach((v, i) => {
    const count = parseInt(v.vacancy_count, 10);
    if (v.vacancy_count && (isNaN(count) || count < 0)) {
      errors.push(`Vacancy ${i + 1}: Vacancy count must be a non-negative number.`);
    }
  });

  if (forPublish) {
    if (!data.description?.trim()) {
      errors.push('Description is required to publish.');
    }
    if (!data.application_start) {
      errors.push('Application Start date is required to publish.');
    }
    if (!data.application_end) {
      errors.push('Application End date is required to publish.');
    }
    if (data.verification_status === 'unverified') {
      errors.push('Job must be at least "Pending Review" before publishing.');
    }
  }

  return { valid: errors.length === 0, errors };
}
