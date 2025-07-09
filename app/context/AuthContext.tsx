'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type AuthContextType = {
    isAuthenticated: boolean
    login: (token: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    login: () => {},
    logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        console.log('Token from localStorage:', token)
        if (token) {
            setIsAuthenticated(true)
        }
    }, [])

    const login = (token: string) => {
        localStorage.setItem('accessToken', token)
        setIsAuthenticated(true)
    }

    const logout = () => {
        localStorage.removeItem('accessToken')
        setIsAuthenticated(false)
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
