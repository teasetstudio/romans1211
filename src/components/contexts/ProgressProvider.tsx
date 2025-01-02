'use client';

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';
type Props = { children?: React.ReactNode; };

export const ProgressProvider = ({ children }: Props) => {
  return (
    <>
      {children}
      <ProgressBar
        height="4px"
        color="#00bfff"
        options={{ showSpinner: false }}
        shallowRouting
      />
    </>
  );
};
