import Image from "next/image";
import Link from "next/link";

const WHATSAPP_NUMBER = "447927970960";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export default function WhatsAppFAB() {
  return (
    <Link
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed bottom-6 right-6 z-[9999]
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#25D366]
        shadow-[0_4px_20px_rgba(37,211,102,0.45)]
        transition-all duration-200 ease-in-out
        hover:scale-110 hover:shadow-[0_6px_28px_rgba(37,211,102,0.6)]
        active:scale-95
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50
        sm:bottom-8 sm:right-8
      "
    >
      <Image
        src="/whatsapp.svg"
        alt="WhatsApp"
        width={30}
        height={30}
        priority
      />
    </Link>
  );
}
