'use client';
import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import ConnectButtonWithSkeleton from "./ConnectButtonWithSkeleton";
import HeaderBalance from './HeaderBalance';

const Header = () => {
    return (
			<header className='py-4 px-6 flex items-center justify-between shadow-md text-black'>
				<div className='text-2xl font-bold'>Web3 University</div>

				<nav className='flex space-x-8'>
					<Link
						href='/'
						className='hover:text-blue-400 transition duration-300'
					>
						Swap
					</Link>
					<Link
						href='/courses'
						className='hover:text-blue-400 transition duration-300'
					>
						Courses
					</Link>
					<Link
						href='/dashboard'
						className='hover:text-blue-400 transition duration-300'
					>
						Dashboard
					</Link>
					<Link
						href='/about'
						className='hover:text-blue-400 transition duration-300'
					>
						About
					</Link>
				</nav>
				<div className='flex items-center space-x-3'>
					<HeaderBalance />
					<ConnectButtonWithSkeleton />
				</div>
			</header>
		);
}
 
export default Header;