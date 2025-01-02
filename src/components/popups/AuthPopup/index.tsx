"use client"

import { DialogBackdrop, DialogPanel, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { useTranslations } from 'next-intl';
import { Dialog } from '@headlessui/react'

import H9 from '@/components/typo/H9'
import { NAMESPACE_COMMON } from '@/res/namespaces'

import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

interface IProps {
  isOpen: boolean
  onClose: () => void
}

const AuthPopup = ({ isOpen, onClose }: IProps) => {
  const t = useTranslations(NAMESPACE_COMMON)

  const tabClasses = (selected: boolean): string => {
    const selecedClasses = selected ? 'bg-primary text-white' : 'text-gray1'
    return `${selecedClasses} w-1/2 py-3 rounded-lg`
  }

  return (
    <Dialog
      open={isOpen}
      // portalClassName="relative z-50"
      // bodyOpenClassName={`overflow-hidden ${
      //   !isMobile.current && 'body_padding'
      // }`}
      // overlayClassName="fixed top-0 left-0 w-full h-screen bg-black bg-opacity-50 flex items-center"
      className="relative z-50"
      // className="mx-auto bg-white w-full max-w-[530px] rounded-2xl sm:rounded-[36px] p-8 sm:p-14 border border-gray3"
      onClose={onClose}
      // onRequestClose={onClose}
      // closeTimeoutMS={200}
      // ariaHideApp={false}
      // preventScroll={true}
    >
      <DialogBackdrop className="fixed inset-0 bg-black/50" />

      <div className="fixed inset-0 w-screen overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className='w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px]'>
            <TabGroup>
              <TabList className="w-full p-1 bg-gray5 rounded-lg border border-gray3">
                <Tab className={({ selected }) => tabClasses(selected)}>
                  <H9 weight="semibold" color="col-inherit">
                    {t('auth.log_in')}
                  </H9>
                </Tab>
                <Tab className={({ selected }) => tabClasses(selected)}>
                  <H9 weight="semibold" color="col-inherit">
                    {t('auth.register')}
                  </H9>
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <LoginForm />
                </TabPanel>

                <TabPanel>
                  <RegisterForm />
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default AuthPopup
