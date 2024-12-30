import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <header className="header">
        <Image
          src="/logo.svg"
          alt="Logo"
          width={150}
          height={50}
          priority
        />
      </header>
      <main className="main-content">
        <h1>Welcome to Sky Clothing</h1>
        <p>Your one-stop shop for the latest fashion trends.</p>
        <nav>
          <ul>
            <li><Link href="/category">Category</Link></li>
            <li><Link href="/product/1">Detail</Link></li>
            <li><Link href="/login">Login</Link></li>
            <li><Link href="/register">Register</Link></li>
          </ul>
        </nav>
      </main>
      <footer className="footer">
        <p>&copy; 2023 Sky Clothing. All rights reserved.</p>
      </footer>
    </div>
  );
}
