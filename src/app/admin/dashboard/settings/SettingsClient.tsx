"use client";

import React from "react";
import { Toast } from "@/components/ui/Toast";
import { useSettingsClient } from "@/hooks/useSettingsClient";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/framer-motion/animation-logs";
import InfoTooltip from "@/components/ui/InfoTooltip";
import {IInitialSettings} from "@/types/settings";

const labelClass = "block text-[11px] font-bold uppercase tracking-widest text-graphite/50 dark:text-zinc-500 mb-2.5 ml-1";
const inputClass = "w-full px-4 py-3.5 bg-beige-light/40 dark:bg-zinc-800/50 border border-beige-dark/30 dark:border-zinc-700/60 rounded-xl focus:bg-white dark:focus:bg-[#202020] focus:ring-4 focus:ring-sage/15 dark:focus:ring-emerald-500/10 focus:border-sage dark:focus:border-emerald-500/50 transition-all duration-300 text-[14px] font-medium text-graphite dark:text-zinc-200 placeholder:text-graphite/30 dark:placeholder:text-zinc-600 outline-none shadow-sm hover:border-beige-dark/60 dark:hover:border-zinc-600";


export default function SettingsClient({ initialSettings }: IInitialSettings ) {
    const {
        formData,
        isLoading,
        handleChange,
        handleSubmit,
        toast,
        hideToast
    } = useSettingsClient(initialSettings);

    return (
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-6 sm:space-y-8 relative"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <Toast toast={toast} onClose={hideToast} />

            <motion.div variants={itemVariants} className="mb-6 sm:mb-10">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sage dark:text-emerald-400 mb-2">
                    Personalizacja i integracje
                </p>
                <h1 className="text-3xl sm:text-4xl font-serif text-graphite dark:text-zinc-100 tracking-tight mb-3">
                    Ustawienia Systemu
                </h1>
                <p className="text-sm sm:text-base font-medium text-graphite/60 dark:text-zinc-400 max-w-2xl leading-relaxed">
                    Zarządzaj informacjami kontaktowymi, danymi do przelewów oraz linkami do social mediów. Zmiany
                    zaktualizują się natychmiast na całej platformie.
                </p>
            </motion.div>

            <motion.div variants={itemVariants} className="relative z-10 hover:z-[100] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 lg:p-10 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-sage/10 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 text-sage dark:text-emerald-400 border border-sage/20 dark:border-emerald-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xl font-serif font-bold text-graphite dark:text-zinc-100 tracking-tight">Dane kontaktowe</h2>
                            <InfoTooltip
                                title="Globalna synchronizacja"
                                description="Zmieniony tu e-mail i telefon automatycznie zaktualizują się w stopce strony, w formularzach kontaktowych oraz w wiadomościach wysyłanych do pacjentów."
                                images={["/screenshots/tooltip-contact.png", "/screenshots/tooltip-contact-2.png"]}
                            />
                        </div>
                        <p className="text-xs font-medium text-graphite/50 dark:text-zinc-400 mt-1">Podstawowe informacje o Twoim gabinecie</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                    <div>
                        <label className={labelClass}>Nazwa / Imię i nazwisko</label>
                        <input type="text" name="clinicName" value={formData.clinicName} onChange={handleChange} className={inputClass} placeholder="Np. Jan Kowalski Stomatologia" />
                    </div>
                    <div>
                        <label className={labelClass}>Adres e-mail</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="kontakt@twojgabinet.pl" />
                    </div>
                    <div>
                        <label className={labelClass}>Numer telefonu</label>
                        <input type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="+48 000 000 000" className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Adres (opcjonalnie)</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative z-10 hover:z-[100] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 lg:p-10 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xl font-serif font-bold text-graphite dark:text-zinc-100 tracking-tight">Finanse i rozliczenia</h2>
                            <InfoTooltip
                                title="Przelewy tradycyjne"
                                description="Numer konta jest dołączany do maila z potwierdzeniem tylko wtedy, gdy ręcznie dodasz wizytę dla pacjenta w panelu (np. po rezerwacji telefonicznej). Informuje to pacjenta, że musi opłacić wizytę przelewem, pomijając system Stripe."
                                images={[ "/screenshots/tooltip-iban-2.png", "/screenshots/tooltip-iban.png"]}
                            />
                        </div>
                        <p className="text-xs font-medium text-graphite/50 dark:text-zinc-400 mt-1">Konto bankowe do przelewów tradycyjnych</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                <div>
                    <label className={labelClass}>Numer konta bankowego (IBAN)</label>
                    <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} className={`${inputClass} font-mono tracking-wider`} />
                </div>
                <div>
                    <label className={labelClass}>NIP</label>
                    <input type="text" name="nipNumber" value={formData.nipNumber} onChange={handleChange}
                           className={`${inputClass} font-mono tracking-wider`}/>
                </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants}
                        className="relative z-10 hover:z-[100] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl border border-beige-dark/20 dark:border-zinc-700/80 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] p-6 sm:p-8 lg:p-10 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xl font-serif font-bold text-graphite dark:text-zinc-100 tracking-tight">Profile zewnętrzne</h2>
                            <InfoTooltip
                                title="Dynamiczne ikony social media"
                                description="Wklejenie linku w którekolwiek z tych miejsc natychmiast aktywuje odpowiednią ikonę (np. logo Instagrama) w stopce głównej strony."
                            />
                        </div>
                        <p className="text-xs font-medium text-graphite/50 dark:text-zinc-400 mt-1">Odnośniki widoczne w stopce i na stronie powitalnej</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7">
                    <div>
                        <label className={labelClass}>ZnanyLekarz</label>
                        <input type="url" name="znanyLekarzUrl" value={formData.znanyLekarzUrl} onChange={handleChange} placeholder="https://www.znanylekarz.pl/..." className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>LinkedIn</label>
                        <input type="url" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleChange} placeholder="https://linkedin.com/in/..." className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Instagram</label>
                        <input type="url" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} placeholder="https://instagram.com/..." className={inputClass} />
                    </div>
                    <div>
                        <label className={labelClass}>Facebook</label>
                        <input type="url" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} placeholder="https://facebook.com/..." className={inputClass} />
                    </div>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end pt-4 pb-8">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative w-full sm:w-auto px-8 py-4 bg-graphite dark:bg-zinc-100 text-white dark:text-graphite font-bold rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

                    {isLoading ? (
                        <span className="animate-spin w-5 h-5 border-[3px] border-current border-t-transparent rounded-full"></span>
                    ) : (
                        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    )}
                    <span className="tracking-wide">Zapisz ustawienia</span>
                </button>
            </motion.div>
        </motion.form>
    );
}