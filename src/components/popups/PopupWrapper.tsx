import { useEffect, useRef } from 'react'
import { Dialog } from '@headlessui/react'

interface IProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  portalClassName?: string
  contentClassName?: string
  overlayClassName?: string
  contentRef?: any
}

const PopupWrapper = ({
  isOpen,
  onClose,
  children,
  portalClassName,
  contentClassName = '',
  overlayClassName = '',
  contentRef,
}: IProps) => {
  const isMobile = useRef(false)
  const scrollBarWidth = useRef(15)

  useEffect(() => {
    isMobile.current =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
  })

  useEffect(() => {
    const curBodyPadding = window.getComputedStyle(document.body).paddingRight
    const pxToNumber = Number(curBodyPadding.replace(/px$/, ''))
    scrollBarWidth.current =
      pxToNumber || window.innerWidth - document.documentElement.clientWidth
  }, [])

  return (
    <Dialog
      open={isOpen}
      // portalClassName={portalClassName ? portalClassName : 'relative z-50'}
      // bodyOpenClassName={`overflow-hidden ${
      //   !isMobile.current && 'bodyPadding'
      // }`}
      // overlayClassName={
      //   overlayClassName
      //     ? overlayClassName
      //     : 'fixed z-50 inset-0 bg-black bg-opacity-50 transition-opacity overflow-y-auto'
      // }
      className={contentClassName}
      onClose={onClose}
      // closeTimeoutMS={200}
      // ariaHideApp={false}
      // preventScroll={true}
      // contentRef={(node) => {
      //   if (contentRef) {
      //     contentRef.current = node
      //   }
      // }}
    >
      {children}
      <style jsx global>{`
        .bodyPadding {
          padding-right: ${scrollBarWidth.current}px;
        }
        .ReactModal__Overlay {
          opacity: 0;
          transition: opacity 200ms ease-in-out;
        }

        .ReactModal__Overlay--after-open {
          opacity: 1;
        }

        .ReactModal__Overlay--before-close {
          opacity: 0;
        }
      `}</style>
    </Dialog>
  )
}

export default PopupWrapper
