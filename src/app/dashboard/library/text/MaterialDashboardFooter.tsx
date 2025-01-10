import React from 'react'

interface IProps {
  organizationName: string
  createdAt: Date
  updatedAt: Date
}

const MaterialDashboardFooter = ({ organizationName, createdAt, updatedAt }: IProps) => {
  return (
    <div className="mt-8 pt-8 border-t border-gray-200">
      <div className="flex flex-wrap gap-3 justify-between items-center text-sm text-gray-500">
        <div>Organization: {organizationName}</div>
        <div className="flex gap-4">
          <div>
            Created: {new Date(createdAt).toLocaleDateString()}
          </div>
          <div>
            Last updated: {new Date(updatedAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaterialDashboardFooter