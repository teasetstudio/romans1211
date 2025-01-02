import React from 'react'
import Link from 'next/link'

import { IconArticle, IconComments, IconDashboard, IconHome, IconLibrary, IconProfile, IconUser, IconUsers } from '@/res/icons'
import LogoutBtn from '../client/LogoutBtn'
import { ROUTE_DASHBOARD, ROUTE_DASHBOARD_LIBRARY, ROUTE_SETTINGS } from '@/res/routes'

interface IProps {
  children: React.ReactNode
}

const Sidebar = ({ children }: IProps) => {

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-gray-800 rounded-2xl">
        <div className="flex flex-col flex-1 overflow-y-auto">
          <div className="flex flex-col flex-1 overflow-y-auto bg-gradient-to-b from-dark to-primary p-2 gap-2 rounded-2xl">
            <div className='flex-auto'>
              <LinkItem href='/' text='Home' icon={IconHome} />
              <div className='text-gray-300 my-5'>Organization</div>
              <nav className="flex flex-col flex-1 gap-2">
                <LinkItem href={ROUTE_DASHBOARD} text='Dashboard' icon={IconDashboard} />
                <LinkItem href={ROUTE_DASHBOARD_LIBRARY} text='Library' icon={IconLibrary} />
                <LinkItem href={ROUTE_SETTINGS} text='Profile' icon={IconProfile} />
                {/* 
                <LinkItem href='/' text='Article' icon={IconArticle} />
                <LinkItem href='/' text='Users' icon={IconUsers} />
                <LinkItem href='/' text='Comments' icon={IconComments} /> */}
              </nav>
            </div>

            <div className='text-gray-100'>
              <LogoutBtn />
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className='overflow-y-auto flex flex-col flex-1'>
        {children}
      </div>
    </div>
  )
}

export default Sidebar

interface ILinkProps {
  href: string
  text: string
  icon: any
}

const LinkItem = ({ href, text, icon: Icon }: ILinkProps) => {
  return (
    <Link href={href} className="flex gap-2 items-center px-4 py-2 mt-2 text-gray3 hover:bg-primary hover:underline hover:bg-opacity-20 rounded-md">
      <span className='w-6'><Icon /></span>
      {text}
    </Link>
  )
}
