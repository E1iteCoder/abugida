#!/usr/bin/env python3
"""Parse user-provided URLs and update audio.js. Skips uh.mp3."""
import re

# User-provided list (paste as-is; explicit mappings like "Ci.mp3 = URL" and plain URLs)
LINES = """
https://res.cloudinary.com/dc6jadrue/video/upload/v1769834000/zu_ilgfkk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769834000/ze_a5dfcp.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833996/zo_dgw1gd.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833995/zie_ql328b.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833995/zi_zqhpwi.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833995/zhu_nxmyfo.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833990/zho_i797iy.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833990/zhie_cj394j.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833989/zhi_nc17mj.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833989/zhe_eq7rlb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833989/zha_tztr1t.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833984/zh_c1q2ie.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833983/za_kgs0vf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833983/z_uhmxcr.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833982/yu_p9e36p.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833982/yo_xhoppr.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833977/yie_fjvtn2.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833977/yi_gigxrs.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833977/ye_rlhotn.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833977/ya_t2ocdk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833972/y_ikb7ph.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833972/wu_vals55.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833972/wi_m0uygg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833971/wo_h9s1yd.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833969/wie_jflsnz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833966/vu_fqj4s2.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833965/we_degm5z.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833965/wa_esyude.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833965/w_ecjlo9.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833961/vo_waybhd.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833961/vie_m59dnm.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833961/vi_wsyizg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833960/ve_clqunk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833958/va_kspmc7.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833957/v_tfwzmn.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833956/u_m8hqax.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833955/tu_sghclw.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833953/ttu_seydei.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833952/tto_kilels.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833952/ttie_yfbfr6.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833952/tti_a4ejon.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833948/tte_tbwvln.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833947/tt_fi4con.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833947/tta_in9pgz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833947/tsu_mnz13h.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833947/tso_iu3qoc.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833943/tsie_p6j3j4.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833943/tsi_sboflr.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833943/tse_nrpqsk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833942/tsa_wbgyaf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833939/ts_flth6p.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833938/try_up9zcz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833938/to_ayuyep.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833938/tie_emoqeh.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833934/ti_o8k8l3.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833934/te_darsts.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833934/ta_f9kfhd.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833934/t_fpwkqx.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833930/su_zqm9zy.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833930/so_n31dcs.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833930/sie_vrvavg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833930/si_aqvfnw.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833926/shu_v1yuy4.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833925/sho_r0e9fw.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833925/shie_jiiha7.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833924/shi_kc5goi.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833924/she_znrjaf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833921/sha_ql3p6r.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833920/sh_zbc6mb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833920/se_scj1ro.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833920/sa_avhrwc.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833919/ro_y0wgnf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833916/s_mu5ppx.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833915/ri_cyeaee.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833915/ru_cyix9s.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833915/rie_cgw1xm.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833915/re_sw3yj0.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833910/ra_r9fs0j.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833909/r_ro0fy0.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833909/qu_q4akzb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833909/qo_ogrf2u.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833909/qie_vj2uay.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833905/qi_gyll0o.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833905/qe_xniiij.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833904/qa_wglggv.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833904/q_hibzrl.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833904/pu_zn7dxf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833901/ppu_hki5n3.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833900/ppo_kigrfw.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833900/ppie_w6khkn.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833900/ppi_mqjmw4.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833900/ppe_seu0xz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833897/ppa_gsfapz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833896/pp_vo1nip.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833895/o_ywrmhe.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833895/po_w2qxhi.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833894/pie_n7hisl.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833894/pi_reriki.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833891/pe_qhkbsp.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833890/pa_gvlx96.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833890/p_j0o38d.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833889/nu_ugkckm.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833889/no_t45kkf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833889/nie_eqgws0.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833887/ni_qlqrou.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833885/ne_vvreto.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833884/na_gsfhzy.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833884/n_bdqxmh.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833883/mu_ncch1x.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833882/mo_qzhx4v.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833879/lu_xrisvh.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833880/mie_lyy9ud.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833879/mi_i3mjkk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833879/me_hs11yk.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833878/ma_wvljv3.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833878/m_zppr4s.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833877/lo_ivosae.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833875/lie_otqce6.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833875/li_kzboyg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833874/le_bdb93b.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833872/l_gjjl9l.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833871/la_vhuikp.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833869/kie_aghvzg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833868/ku_ekje34.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833868/ko_p7mkca.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833867/ki_yfiw1l.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833865/ke_ixsdit.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833864/ka_taw4ry.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833864/k_pgmh5e.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833864/ju_gwfuah.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833863/jo_g3xjuv.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833861/jie_tjowb0.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833860/ji_c5cefy.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833859/je_hfuhjs.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833858/ja_lrrwgr.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833857/j_tjklnv.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833856/ie_h42jog.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833855/i_eozsze.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833855/huh_mcczzg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833854/hu_pqjrpc.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833853/ho_xr8kg2.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833850/hie_kebb4u.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833849/ha_hfqkyz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833849/hi_uus2yr.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833849/go_klfjhb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833849/h_cv56u0.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833845/gu_tv6pet.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833844/gnu_wbgpji.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833844/gna_ejwgqg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833844/gno_ss1kau.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833844/gnie_za2eis.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833838/gni_lkxmjp.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833838/gne_u9hrny.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833838/gn_v1okju.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833837/gie_jztqmu.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833834/gi_nlxnhb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833834/ge_xsd5wf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833834/ga_wvh9tw.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833834/g_d71u2p.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833830/fo_wi48d3.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833830/fu_rvgtsj.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833830/fie_kat4dm.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833830/fi_debb2s.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833826/fe_rd9cpd.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833825/fa_eqzdei.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833825/f_fcpkby.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833825/ee_rjh6sq.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833824/du_cuimvh.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833823/do_l186fo.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833822/die_anl51h.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833821/di_kpzwzu.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833821/de_ax5gry.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833820/da_o4hjbc.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833819/d_iwi684.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833819/chu_lkjips.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833818/cho_do6qcq.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833816/chie_a1sqj2.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833816/chi_rrumvb.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833815/che_meic1g.mp3
Ci.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833814/ch_i_oadvgf.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833815/cha_jhvkvu.mp3
Cu.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833814/ch_u_d9jsic.mp3
Co.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833814/ch_o_ofcpdq.mp3
Cie.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833814/ch_ie_iffutb.mp3
Ce.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833813/ch_e_u9rkxq.mp3
Ca.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833812/ch_a_xp6g9y.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833812/bu_g9zwk7.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833811/bo_gi7d8f.mp3
C.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833811/c_h_j0derz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833811/ch_npjfub.mp3
bee.mp3 = https://res.cloudinary.com/dc6jadrue/video/upload/v1769833810/bi_c92zpz.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833810/bie_ikzoxy.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833810/be_eqtsii.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833809/ba_qll6o8.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833809/aa_a9etyg.mp3
https://res.cloudinary.com/dc6jadrue/video/upload/v1769833809/b_fosoqt.mp3
""".strip().split('\n')

def main():
    mapping = {}
    # Explicit key = URL
    for line in LINES:
        line = line.strip()
        if not line:
            continue
        m = re.match(r'^([A-Za-z]+\.mp3)\s*=\s*(https://\S+)$', line)
        if m:
            mapping[m.group(1)] = m.group(2)
            continue
        # Plain URL: extract key from filename (part before _)
        if line.startswith('https://'):
            url = line
            name = re.search(r'/([^/]+)\.mp3$', url)
            if name:
                key = name.group(1).split('_')[0] + '.mp3'
                if key not in mapping:
                    mapping[key] = url

    audio_js_path = 'src/client/data/audio.js'
    with open(audio_js_path, 'r') as f:
        content = f.read()

    skip_keys = {'uh.mp3'}
    updated = 0
    for key, url in mapping.items():
        if key in skip_keys:
            continue
        pattern = rf'("{re.escape(key)}":\s*\n\s*)"[^"]*"'
        replacement = rf'\1"{url}"'
        new_content, n = re.subn(pattern, replacement, content, count=1)
        if n:
            content = new_content
            updated += 1

    with open(audio_js_path, 'w') as f:
        f.write(content)
    print(f"Updated {updated} entries in audio.js (skipped uh.mp3)")

if __name__ == '__main__':
    main()
