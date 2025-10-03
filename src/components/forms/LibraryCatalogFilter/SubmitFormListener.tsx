'use client';

import { useSearchParams } from 'next/navigation';
import { usePathname } from '@/i18n/routing'
import { useEffect, memo } from 'react';
import { useNavigateWithProgress } from '@/hooks/useNavigateWithProgress';

const SubmitFormListener = memo(function SubmitFormListener() {
  const { navigateWithProgress } = useNavigateWithProgress();
  const searchParams = useSearchParams();
  const pathname = usePathname()

  useEffect(() => {
    const form = document.getElementById('library-catalog-form') as HTMLFormElement;
    if (!form) return;
    console.log('hello')

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
    // tags is a react state and managed by the parent component - no need to update it here

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

      const targetUrl = `${pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      navigateWithProgress(targetUrl);
    };

    form.addEventListener('submit', handleSubmit);
    return () => form.removeEventListener('submit', handleSubmit);
  }, [navigateWithProgress, searchParams, pathname]);

  return null;
});

export { SubmitFormListener };
