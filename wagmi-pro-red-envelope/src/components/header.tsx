import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

const Header = () => {
    return (<header className="bg-gray-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Wagmi Contracts</h1>
            <nav>
                <ul className="flex space-x-4">
                    <li><Link href={'/'} className="hover:text-gray-300">主页</Link></li>
                    <li><Link href={'/redEnvelope'} className="hover:text-gray-300">抢红包</Link></li>
                    <li><Link href={'/ethersjs'} className="hover:text-gray-300">ethersjs</Link></li>
                </ul>
            </nav>
            <div className="min-w-[200px]">
                <ConnectButton />
            </div>
        </div>
    </header>);
}

export default Header;