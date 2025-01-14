import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="m-auto">
      <div className="p-5 bg-slate-800 shadow-lg rounded-full m-auto text-xl">
        <h1>Unfortunately, the page that you were looking for does not exist.</h1>
      </div>
      <Link href="/" className="m-5 rounded-full p-4 absolute">Go Back</Link>
    </div>
  );
}