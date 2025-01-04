import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full bg-white py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Social Media Section */}
        <div className="text-center space-y-4">
          <h2 className="text-xl font-medium tracking-wider">THEO DÕI SKY NGAY</h2>
          <div className="flex justify-center items-center space-x-4">
            <Link href="https://facebook.com" className="text-gray-600 hover:text-gray-900">FACEBOOK</Link>
            <span className="text-gray-400">|</span>
            <Link href="https://shopee.vn" className="text-gray-600 hover:text-gray-900">SHOPEE</Link>
            <span className="text-gray-400">|</span>
            <Link href="https://tiktok.com" className="text-gray-600 hover:text-gray-900">TIKTOK</Link>
            <span className="text-gray-400">|</span>
            <Link href="https://instagram.com" className="text-gray-600 hover:text-gray-900">INSTAGRAM</Link>
          </div>
        </div>

        {/* Policy Links */}
        <div className="flex justify-center items-center flex-wrap gap-2 text-sm">
          <Link href="/chinh-sach-doi-tra" className="text-gray-600 hover:text-gray-900">
            CHÍNH SÁCH ĐỔI TRẢ
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/chinh-sach-bao-mat" className="text-gray-600 hover:text-gray-900">
            CHÍNH SÁCH BẢO MẬT
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/he-thong-thanh-vien" className="text-gray-600 hover:text-gray-900">
            HỆ THỐNG THÀNH VIÊN
          </Link>
          <span className="text-gray-400">|</span>
          <Link href="/he-thong-cua-hang" className="text-gray-600 hover:text-gray-900">
            HỆ THỐNG CỬA HÀNG
          </Link>
        </div>

        {/* Business Information */}
        <div className="text-center space-y-2 text-sm text-gray-600">
          <h3 className="font-medium">HỘ KINH DOANH SKY-CLOTHING</h3>
          <p>Trụ sở : 3xx/x6 Lê Đức Thọ, Phường 6, Quận Gò Vấp, Thành phố Hồ Chí Minh</p>
          <p>Mã số hộ kinh doanh: 8116645121-001</p>
        </div>

        {/* Copyright */}
        <div className="text-center text-sm text-gray-600">
          <p>Copyright 2025 © SLY</p>
        </div>
      </div>
    </footer>
  )
}

