/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react'
import { useConnectionStatus } from '@/hooks/use-connection-status'

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

describe('useConnectionStatus', () => {
  beforeEach(() => {
    // Reset navigator.onLine to true
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    })
    
    // Clear any existing event listeners
    jest.clearAllMocks()
  })

  it('should return initial online status', () => {
    const { result } = renderHook(() => useConnectionStatus())
    
    expect(result.current.status).toBe('online')
    expect(result.current.isOnline).toBe(true)
    expect(result.current.isOffline).toBe(false)
    expect(result.current.lastSync).toBeInstanceOf(Date)
  })

  it('should return initial offline status when navigator is offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    const { result } = renderHook(() => useConnectionStatus())
    
    expect(result.current.status).toBe('offline')
    expect(result.current.isOnline).toBe(false)
    expect(result.current.isOffline).toBe(true)
  })

  it('should update status when going online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    const { result } = renderHook(() => useConnectionStatus())
    
    // Initially offline
    expect(result.current.status).toBe('offline')
    
    // Simulate going online
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      })
      
      // Trigger online event
      const onlineEvent = new Event('online')
      window.dispatchEvent(onlineEvent)
    })
    
    expect(result.current.status).toBe('online')
    expect(result.current.isOnline).toBe(true)
    expect(result.current.lastSync).toBeInstanceOf(Date)
  })

  it('should update status when going offline', () => {
    const { result } = renderHook(() => useConnectionStatus())
    
    // Initially online
    expect(result.current.status).toBe('online')
    
    // Simulate going offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      })
      
      // Trigger offline event
      const offlineEvent = new Event('offline')
      window.dispatchEvent(offlineEvent)
    })
    
    expect(result.current.status).toBe('offline')
    expect(result.current.isOffline).toBe(true)
  })

  it('should update lastSync when going online', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: false
    })
    
    const { result } = renderHook(() => useConnectionStatus())
    
    const initialLastSync = result.current.lastSync
    
    // Wait a bit to ensure time difference
    setTimeout(() => {
      act(() => {
        Object.defineProperty(navigator, 'onLine', {
          writable: true,
          value: true
        })
        
        // Trigger online event
        const onlineEvent = new Event('online')
        window.dispatchEvent(onlineEvent)
      })
      
      expect(result.current.lastSync).not.toBe(initialLastSync)
      expect(result.current.lastSync).toBeInstanceOf(Date)
    }, 10)
  })

  it('should clean up event listeners on unmount', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    
    const { unmount } = renderHook(() => useConnectionStatus())
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    
    unmount()
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
    
    addEventListenerSpy.mockRestore()
    removeEventListenerSpy.mockRestore()
  })
})