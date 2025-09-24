'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing'
import { useEffect } from 'react';
import NProgress from 'nprogress';

export function SubmitFormListener() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname()

  useEffect(() => {
    const form = document.getElementById('library-catalog-form') as HTMLFormElement;
    if (!form) return;

    // Update select type value after removing active filter
    const typeSelect = form.querySelector('select[name="type"]') as HTMLSelectElement;
    if (typeSelect) {
      const typeParam = searchParams.get('type');
      if (typeParam !== typeSelect.value) typeSelect.value = typeParam || '';
    }
    // Update search-term input value after removing active filter
    const searchTermInput = form.querySelector('input[name="search-term"]') as HTMLInputElement;
    if (searchTermInput) {
      const searchTermParam = searchParams.get('search-term');
      if (searchTermParam !== searchTermInput.value) searchTermInput.value = searchTermParam || '';
    }
    // Update tags input value after removing active filter
    const tagsInput = form.querySelector('input[name="tags"]') as HTMLInputElement;
    if (tagsInput) {
      const tagsParam = searchParams.get('tags');
      if (tagsParam !== tagsInput.value) tagsInput.value = tagsParam || '';
    }

    const handleSubmit = (e: SubmitEvent) => {
      e.preventDefault();
      const formData = new FormData(form);
      const params = new URLSearchParams(searchParams);

      formData.forEach((value, key) => {
        if (value && value.toString().trim()) {
          params.set(key, value.toString().trim());
        } else {
          params.delete(key);
        }
      });

      NProgress.start();
      router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`);
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [router, searchParams, pathname]);

  return null;
}