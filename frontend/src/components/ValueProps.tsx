import { Users, Zap } from "lucide-react";

export default function ValueProps() {
  return (
    <section className="section-value-props">
      <div className="container">
        <div className="value-props-grid-three">
          
          {/* Card 1 */}
          <div className="value-card-custom">
            <div className="value-icon-custom">
              <Users size={22} />
            </div>
            <h3 className="value-title-custom">Fokus Komunitas</h3>
            <p className="value-desc-custom">
              Kami menghubungkan langsung pembeli dengan ribuan pengusaha lokal di seluruh Indonesia untuk membangun ekonomi mandiri.
            </p>
          </div>

          {/* Card 2 - No Icon */}
          <div className="value-card-custom no-icon-card">
            <h3 className="value-title-custom">Kualitas Terjamin</h3>
            <p className="value-desc-custom">
              Setiap produk di Pelataran UMKM telah melewati proses kurasi ketat untuk memastikan standar kualitas tinggi bagi pelanggan.
            </p>
          </div>

          {/* Card 3 */}
          <div className="value-card-custom">
            <div className="value-icon-custom">
              <Zap size={22} fill="currentColor" />
            </div>
            <h3 className="value-title-custom">Transaksi Mudah</h3>
            <p className="value-desc-custom">
              Sistem pembayaran yang aman dan berbagai pilihan logistik memudahkan setiap langkah belanja Anda dari mana saja.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
