/*
 * DIMENSI: akses ahli JomMain
 * Code Snippets (scope: global) on dtconnect.org. Kept in the JomMain repo for reference only;
 * the live copy is the snippet named "DIMENSI: akses ahli JomMain" in wp-admin.
 *
 * Every DIMENSI member gets a "tiket" (ticket): base64url(JSON {no, nama, iat, exp}) + "." + base64url(ECDSA P-256 signature).
 * JomMain checks the signature in the browser with the public key, so it stays a static site.
 *   GET  /wp-json/dimensi/v1/jommain/kunci   public key (JWK x, y)
 *   POST /wp-json/dimensi/v1/jommain/pautan  {emel}  emails a sign-in link to a registered member
 *   POST /wp-json/dimensi/v1/jommain/maklum-balas  {t, ...}  members' feedback, emailed to the developer
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

/* ---------- Maklum balas (feedback) from JomMain, members only ----------
 * POST /wp-json/dimensi/v1/jommain/maklum-balas
 *   {t, permainan, tajuk, jenis, daripada, mesej, bintang, konteks}
 * The ticket is checked here as well, and the member must still be in the directory.
 * The email goes to option dm_jm_mb_to (default: the site admin email), with Reply-To set to the member.
 */

/** Raw r||s (64 bytes) back to the DER form that openssl_verify expects. */
function dm_jm_raw_to_der( $raw ) {
	$der = '';
	foreach ( array( substr( $raw, 0, 32 ), substr( $raw, 32, 32 ) ) as $v ) {
		$v = ltrim( $v, "\0" );
		if ( $v === '' || ( ord( $v[0] ) & 0x80 ) ) {
			$v = "\0" . $v;
		}
		$der .= "\x02" . chr( strlen( $v ) ) . $v;
	}
	return "\x30" . chr( strlen( $der ) ) . $der;
}

function dm_jm_b64d( $s ) {
	$s = strtr( (string) $s, '-_', '+/' );
	return base64_decode( $s . str_repeat( '=', ( 4 - strlen( $s ) % 4 ) % 4 ), true );
}

/** Returns the ticket payload if it is signed by this site and not expired, else null. */
function dm_jm_semak_tiket( $t ) {
	$k = dm_jm_keys();
	$p = explode( '.', (string) $t );
	if ( ! $k || count( $p ) !== 2 ) {
		return null;
	}
	$sig = dm_jm_b64d( $p[1] );
	if ( ! $sig || strlen( $sig ) !== 64 ) {
		return null;
	}
	$d = openssl_pkey_get_details( openssl_pkey_get_private( $k['priv'] ) );
	if ( empty( $d['key'] ) || openssl_verify( $p[0], dm_jm_raw_to_der( $sig ), $d['key'], OPENSSL_ALGO_SHA256 ) !== 1 ) {
		return null;
	}
	$j = json_decode( (string) dm_jm_b64d( $p[0] ), true );
	return ( is_array( $j ) && ! empty( $j['no'] ) && (int) $j['exp'] > time() ) ? $j : null;
}

add_action( 'rest_api_init', function () {
	register_rest_route( 'dimensi/v1', '/jommain/maklum-balas', array(
		'methods'             => 'POST',
		'callback'            => 'dm_jm_maklum_balas',
		'permission_callback' => '__return_true',
	) );
} );

function dm_jm_maklum_balas( WP_REST_Request $r ) {
	$no_resp = function ( $mesej, $status ) {
		return new WP_REST_Response( array( 'ok' => false, 'mesej' => $mesej ), $status );
	};
	$p = dm_jm_semak_tiket( $r->get_param( 't' ) );
	if ( ! $p ) {
		return $no_resp( 'Maklum balas hanya untuk ahli DIMENSI. Sila log masuk semula sebagai ahli.', 403 );
	}
	$ids = get_posts( array(
		'post_type'   => 'dm_ahli',
		'post_status' => 'publish',
		'meta_key'    => 'dm_no',
		'meta_value'  => (string) $p['no'],
		'fields'      => 'ids',
		'numberposts' => 1,
	) );
	if ( ! $ids ) {
		return $no_resp( 'Keahlian ini tidak lagi aktif.', 403 );
	}
	$mesej = trim( sanitize_textarea_field( (string) $r->get_param( 'mesej' ) ) );
	if ( mb_strlen( $mesej ) < 10 ) {
		return $no_resp( 'Tulis sekurang-kurangnya satu ayat (10 aksara).', 400 );
	}
	$mesej = mb_substr( $mesej, 0, 3000 );

	// Limits: 5 per member per hour, 20 per member per day, 15 per IP per hour.
	$ip    = isset( $_SERVER['REMOTE_ADDR'] ) ? (string) $_SERVER['REMOTE_ADDR'] : '';
	$kunci = array(
		array( 'dm_jm_mb_h_' . md5( $p['no'] ), 5, HOUR_IN_SECONDS ),
		array( 'dm_jm_mb_d_' . md5( $p['no'] ), 20, DAY_IN_SECONDS ),
		array( 'dm_jm_mb_ip_' . md5( $ip ), 15, HOUR_IN_SECONDS ),
	);
	foreach ( $kunci as $c ) {
		if ( (int) get_transient( $c[0] ) >= $c[1] ) {
			return $no_resp( 'Terima kasih! Had maklum balas untuk sekarang sudah dicapai. Cuba lagi kemudian.', 429 );
		}
	}

	$teks = function ( $k, $max = 120 ) use ( $r ) {
		return mb_substr( sanitize_text_field( (string) $r->get_param( $k ) ), 0, $max );
	};
	$jenis    = $teks( 'jenis', 40 );
	$tajuk    = $teks( 'tajuk' );
	$game     = $teks( 'permainan', 60 );
	$daripada = $teks( 'daripada', 20 );
	$konteks  = $teks( 'konteks', 400 );
	$bintang  = max( 0, min( 5, (int) $r->get_param( 'bintang' ) ) );
	$pid      = $ids[0];
	$nama     = get_post_field( 'post_title', $pid );
	$emel     = get_post_meta( $pid, 'dm_emel', true );

	$baris = function ( $l, $v ) {
		return $v === '' ? '' : '<tr><td style="padding:4px 12px 4px 0;color:#5b6270;vertical-align:top">' . $l . '</td><td style="padding:4px 0"><b>' . esc_html( $v ) . '</b></td></tr>';
	};
	$html = '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#1f2430;max-width:640px">'
		. '<h2 style="margin:0 0 12px">💬 Maklum balas JomMain</h2>'
		. '<table style="border-collapse:collapse;font-size:15px">'
		. $baris( 'Permainan', $tajuk ? $tajuk . ( $game ? " ($game)" : '' ) : $game )
		. $baris( 'Jenis', $jenis )
		. $baris( 'Penilaian', $bintang ? str_repeat( '★', $bintang ) . str_repeat( '☆', 5 - $bintang ) : '' )
		. $baris( 'Daripada', $daripada )
		. $baris( 'Ahli', $nama . ' · ' . $p['no'] )
		. '</table>'
		. '<div style="margin:16px 0;padding:14px 16px;background:#f5f6f8;border-left:4px solid #e2552d;border-radius:8px;white-space:pre-wrap">' . esc_html( $mesej ) . '</div>'
		. ( $konteks ? '<p style="color:#5b6270;font-size:13px">Konteks: ' . esc_html( $konteks ) . '</p>' : '' )
		. '<p style="color:#5b6270;font-size:13px">Tekan Balas untuk menjawab terus kepada ahli ini.</p></div>';

	$ke      = get_option( 'dm_jm_mb_to' ) ?: get_option( 'admin_email' );
	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	if ( is_email( $emel ) ) {
		$headers[] = 'Reply-To: ' . str_replace( array( "\r", "\n", '<', '>', ',' ), '', $nama ) . ' <' . $emel . '>';
	}
	$subjek = 'Maklum balas JomMain: ' . ( $jenis ?: 'Umum' ) . ( $tajuk ? ' · ' . $tajuk : '' );
	// FluentSMTP's wp_mail can report false after Emailit has accepted the mail, so trust Emailit's own result when it is there.
	unset( $GLOBALS['dm_emailit_last'] );
	$sent = wp_mail( $ke, $subjek, $html, $headers );
	if ( isset( $GLOBALS['dm_emailit_last'] ) ) {
		$sent = $GLOBALS['dm_emailit_last'];
	}
	if ( ! $sent ) {
		return $no_resp( 'Maklum balas tidak dapat dihantar sekarang. Cuba lagi sebentar lagi.', 502 );
	}
	foreach ( $kunci as $c ) {
		set_transient( $c[0], (int) get_transient( $c[0] ) + 1, $c[2] );
	}
	return new WP_REST_Response( array( 'ok' => true, 'mesej' => 'Terima kasih! Maklum balas anda sudah dihantar kepada pembangun JomMain.' ), 200 );
}
