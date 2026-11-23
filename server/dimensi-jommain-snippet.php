/*
 * DIMENSI: akses ahli JomMain
 * Code Snippets (scope: global) on dtconnect.org. Kept in the JomMain repo for reference only;
 * the live copy is the snippet named "DIMENSI: akses ahli JomMain" in wp-admin.
 *
 * Every DIMENSI member gets a "tiket" (ticket): base64url(JSON {no, nama, iat, exp}) + "." + base64url(ECDSA P-256 signature).
 * JomMain checks the signature in the browser with the public key, so it stays a static site.
 *   GET  /wp-json/dimensi/v1/jommain/kunci   public key (JWK x, y)
 *   POST /wp-json/dimensi/v1/jommain/pautan  {emel}  emails a sign-in link to a registered member
 *   /dimensi/v1/daftar success responses also carry the ticket as "jm".
 * On /daftar/?dari=jommain a banner is shown and the new member is sent back to JomMain after signing up.
 */

function dm_jm_b64( $s ) {
	return rtrim( strtr( base64_encode( $s ), '+/', '-_' ), '=' );
}

function dm_jm_keys() {
	$k = get_option( 'dm_jm_keys' );
	if ( is_array( $k ) && ! empty( $k['priv'] ) ) {
		return $k;
	}
	$res = openssl_pkey_new( array( 'private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1' ) );
	if ( ! $res ) {
		return null;
	}
	openssl_pkey_export( $res, $priv );
	$d = openssl_pkey_get_details( $res );
	$k = array(
		'priv' => $priv,
		'x'    => dm_jm_b64( str_pad( $d['ec']['x'], 32, "\0", STR_PAD_LEFT ) ),
		'y'    => dm_jm_b64( str_pad( $d['ec']['y'], 32, "\0", STR_PAD_LEFT ) ),
	);
	add_option( 'dm_jm_keys', $k, '', 'no' );
	return $k;
}

/** openssl_sign gives a DER signature; WebCrypto expects raw r||s (64 bytes). */
function dm_jm_der_to_raw( $der ) {
	$o = 2;
	if ( ord( $der[1] ) & 0x80 ) {
		$o += ord( $der[1] ) & 0x7f;
	}
	$out = '';
	for ( $i = 0; $i < 2; $i++ ) {
		$len = ord( $der[ $o + 1 ] );
		$v   = ltrim( substr( $der, $o + 2, $len ), "\0" );
		$o  += 2 + $len;
		$out .= str_pad( $v, 32, "\0", STR_PAD_LEFT );
	}
	return $out;
}

function dm_jm_tiket( $no, $nama ) {
	$k = dm_jm_keys();
	if ( ! $k || ! $no ) {
		return '';
	}
	$now  = time();
	$data = dm_jm_b64( wp_json_encode( array(
		'no'   => (string) $no,
		'nama' => mb_substr( (string) $nama, 0, 60 ),
		'iat'  => $now,
		'exp'  => $now + YEAR_IN_SECONDS,
	) ) );
	if ( ! openssl_sign( $data, $der, $k['priv'], OPENSSL_ALGO_SHA256 ) ) {
		return '';
	}
	return $data . '.' . dm_jm_b64( dm_jm_der_to_raw( $der ) );
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'dimensi/v1', '/jommain/kunci', array(
		'methods'             => 'GET',
		'callback'            => function () {
			$k = dm_jm_keys();
			return $k ? array( 'kty' => 'EC', 'crv' => 'P-256', 'x' => $k['x'], 'y' => $k['y'] ) : new WP_Error( 'dm_jm', 'Kunci tidak tersedia', array( 'status' => 500 ) );
		},
		'permission_callback' => '__return_true',
	) );
	register_rest_route( 'dimensi/v1', '/jommain/pautan', array(
		'methods'             => 'POST',
		'callback'            => 'dm_jm_pautan',
		'permission_callback' => '__return_true',
	) );
} );

function dm_jm_pautan( WP_REST_Request $r ) {
	$emel = strtolower( sanitize_email( (string) $r->get_param( 'emel' ) ) );
	if ( ! is_email( $emel ) ) {
		return new WP_REST_Response( array( 'ok' => false, 'mesej' => 'Sila masukkan e-mel yang sah.' ), 400 );
	}
	// Same answer whether or not the email is registered, so the form cannot be used to test who is a member.
	$ok = new WP_REST_Response( array( 'ok' => true, 'mesej' => 'Jika e-mel ini berdaftar sebagai ahli DIMENSI, pautan log masuk JomMain sudah dihantar. Semak peti masuk dan folder spam.' ), 200 );

	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
	$ki = 'dm_jm_ip_' . md5( $ip );
	$n  = (int) get_transient( $ki );
	if ( $n >= 10 ) {
		return new WP_REST_Response( array( 'ok' => false, 'mesej' => 'Terlalu banyak cubaan. Sila cuba semula selepas sejam.' ), 429 );
	}
	set_transient( $ki, $n + 1, HOUR_IN_SECONDS );
	$ke = 'dm_jm_em_' . md5( $emel );
	if ( get_transient( $ke ) ) {
		return $ok;
	}
	set_transient( $ke, 1, 2 * MINUTE_IN_SECONDS );

	$ids = get_posts( array(
		'post_type'   => 'dm_ahli',
		'post_status' => 'publish',
		'meta_key'    => 'dm_emel',
		'meta_value'  => $emel,
		'fields'      => 'ids',
		'numberposts' => 1,
	) );
	if ( ! $ids ) {
		return $ok;
	}
	$pid  = $ids[0];
	$no   = get_post_meta( $pid, 'dm_no', true );
	$nama = get_post_field( 'post_title', $pid );
	$t    = dm_jm_tiket( $no, $nama );
	if ( ! $t ) {
		return $ok;
	}
	$url  = 'https://jommain.dtconnect.org/ahli.html#t=' . $t;
	$html = '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2430;max-width:560px">'
		. '<p>Salam ' . esc_html( $nama ) . ',</p>'
		. '<p>Tekan butang di bawah untuk membuka akses penuh <b>JomMain</b> pada peranti ini. Anda tidak perlu kata laluan.</p>'
		. '<p><a href="' . esc_url( $url ) . '" style="display:inline-block;background:#e2552d;color:#fff;font-weight:bold;padding:14px 22px;border-radius:12px;text-decoration:none">🎲 Buka JomMain sebagai ahli</a></p>'
		. '<p>No. ahli: <b>' . esc_html( $no ) . '</b>. Akses sah selama setahun pada peranti ini. Buka pautan yang sama pada komputer kelas atau telefon lain untuk menggunakannya di situ juga.</p>'
		. '<p style="color:#5b6270;font-size:14px">Jika anda tidak meminta pautan ini, abaikan sahaja e-mel ini. Jangan kongsi pautan ini kerana ia memberi akses ahli atas nama anda.</p>'
		. '<p>DIMENSI · Digital Transformation Society · dtconnect.org</p></div>';
	wp_mail( $emel, 'Pautan log masuk JomMain (ahli DIMENSI)', $html, array( 'Content-Type: text/html; charset=UTF-8' ) );
	return $ok;
}

// Give each new member a JomMain ticket in the sign-up response.
add_filter( 'rest_post_dispatch', function ( $res, $server, $req ) {
	if ( $res instanceof WP_REST_Response && $req->get_route() === '/dimensi/v1/daftar' ) {
		$d = $res->get_data();
		if ( is_array( $d ) && ! empty( $d['ok'] ) && ! empty( $d['no'] ) ) {
			$d['jm'] = dm_jm_tiket( $d['no'], isset( $d['nama'] ) ? $d['nama'] : '' );
			$res->set_data( $d );
		}
	}
	return $res;
}, 10, 3 );

// On /daftar/?dari=jommain: show a banner, preselect Guru and send the new member back to JomMain.
add_action( 'wp_footer', function () {
	if ( ! is_page( 'daftar' ) ) {
		return;
	}
	?>
<script>
(function () {
	var JM = 'https://jommain.dtconnect.org/ahli.html';
	var dari = false;
	try {
		if (/[?&]dari=jommain(&|$)/.test(location.search)) sessionStorage.setItem('dm_dari', 'jommain');
		dari = sessionStorage.getItem('dm_dari') === 'jommain';
	} catch (e) { dari = /[?&]dari=jommain(&|$)/.test(location.search); }
	if (!dari) return;
	var f = null;
	for (var n = 0; n < document.forms.length; n++) if (document.forms[n].elements.kategori) { f = document.forms[n]; break; }
	if (f) {
		var b = document.createElement('div');
		b.setAttribute('style', 'background:#fff4e5;border:2px solid #e2552d;border-radius:14px;padding:14px 16px;margin:0 0 18px;font-size:16px;line-height:1.5;color:#1f2430');
		b.innerHTML = '<b>🎲 Daftar percuma untuk akses penuh JomMain</b><br>Semua tahap TP1 hingga TP4, tiga mod permainan, empat pasukan dan simpanan Laporan PBD. Selepas mendaftar, anda dibawa kembali ke JomMain secara automatik.<br><span style="font-size:14px">Sudah ahli? <a href="' + JM + '">Kembali ke JomMain</a> dan pilih "Saya sudah ahli".</span>';
		f.parentNode.insertBefore(b, f);
		var k = f.elements && f.elements.kategori;
		if (k && !k.value) { for (var i = 0; i < k.options.length; i++) if (k.options[i].value === 'Guru') { k.value = 'Guru'; break; } }
	}
	var of = window.fetch;
	window.fetch = function (u) {
		var p = of.apply(this, arguments);
		if (String(u).indexOf('/dimensi/v1/daftar') < 0) return p;
		return p.then(function (r) {
			r.clone().json().then(function (j) {
				if (j && j.ok && j.jm) {
					try { sessionStorage.removeItem('dm_dari'); } catch (e) {}
					setTimeout(function () { location.href = JM + '#t=' + j.jm; }, 3000);
				}
			}).catch(function () {});
			return r;
		});
	};
})();
</script>
	<?php
} );
