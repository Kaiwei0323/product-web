'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [companyname, setCompanyname] = useState('');
    const [creatingUser, setCreatingUser] = useState(false);
    const [userCreated, setUserCreated] = useState(false);
    const [error, setError] = useState(false);
    async function handleFormSubmit(ev: { preventDefault: () => void; }) {
        ev.preventDefault();
        setCreatingUser(true);
        setError(false);
        setUserCreated(false);
        const response = await fetch('/api/register', {
            method: 'POST',
            body: JSON.stringify({email, password, name, companyname}),
            headers: {'Content-Type': 'application/json'}, 
        });

        if (response.ok) {
            setUserCreated(true);
            setEmail('');
            setPassword('');
            setName('');
            setCompanyname('');
        }
        else {
            setError(true);
        }
        setCreatingUser(false);
    }

    return (
        <section className="mt-8">
            <h1 className="text-center text-4xl font-bold mb-5">
                Create Account
            </h1>
            {userCreated && (
                <div className="my-4 text-center">
                    User Created. <br />
                    <Link className={"underline"} href={'/login'}>Login &raquo; Here</Link>
                </div>
            )}
            {error && (
                <div className="my-4 text-center">
                    User already exists or password is too short. <br />
                    Please try again later.
                </div>
            )}
            <form className="block max-w-xs mx-auto" onSubmit={handleFormSubmit}>
                <input type="email" placeholder="email" value={email}
                    disabled={creatingUser}
                    onChange={ev => setEmail(ev.target.value)} />
                <input type="password" placeholder="password" value={password}
                    disabled={creatingUser}
                    onChange={ev => setPassword(ev.target.value)} />
                <input type="text" placeholder="name" value={name}
                    disabled={creatingUser}
                    onChange={ev => setName(ev.target.value)} />
                <input type="text" placeholder="company name" value={companyname}
                    disabled={creatingUser}
                    onChange={ev => setCompanyname(ev.target.value)} />
                <button className="text-white bg-primary px-6 py-2 rounded-xl w-full" type="submit" disabled={creatingUser}>
                    Register
                </button>
                <div className="text-center my-4 text-gray-500 border-t pt-4">
                    Existing account?{' '} 
                    <Link className="underline" href={'/login'}>Login here &raquo;</Link>
                </div>

            </form>

        </section>
    );
}