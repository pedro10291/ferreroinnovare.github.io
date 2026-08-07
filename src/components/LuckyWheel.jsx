/* Template Mestre Ferrer Innovare - Todos os direitos estruturais reservados a Pedro Coutinho. É proibida a replicação do código-fonte estrutural. O cliente detém apenas a titularidade do domínio, dados e conteúdo textual inserido. */

import React, { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Phone } from "lucide-react";
import { themeConfig } from "../config/theme.config";

// Componente da Roleta VIP
export default function LuckyWheel({ showToast }) {
  const [unlocked, setUnlocked] = useState(false);
  const [spinning, setSpinning] = useState(false);
  
  const canvasRef = useRef(null);
  const rotationBoxRef = useRef(null);
  const accumulatedRotationRef = useRef(0);

  const { premios } = themeConfig.marketing;
  const numSlices = premios.length;
  const sliceArc = (2 * Math.PI) / numSlices;

  // Desenhar a roleta no Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numSlices; i++) {
      const angle = i * sliceArc;
      
      // Desenha a fatia
      ctx.beginPath();
      ctx.arc(cx, cy, r, angle, angle + sliceArc);
      ctx.lineTo(cx, cy);
      
      // Cores alternadas da paleta (Branco vs Bege Claro)
      ctx.fillStyle = i % 2 === 0 ? "#FFFFFF" : "#FAF7F2";
      ctx.fill();

      // Borda da fatia
      ctx.strokeStyle = "#EFEBE5";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Desenhar o texto do prêmio rotacionado
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle + sliceArc / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#3E362E"; // Marrom escuro do themeConfig
      ctx.font = "bold 11px Inter, sans-serif";
      ctx.fillText(premios[i], r - 15, 0);
      ctx.restore();
    }

    // Círculo central (Peg decorativo)
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, 2 * Math.PI);
    ctx.fillStyle = "#C8A97E"; // Dourado do themeConfig
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();
  }, [premios, sliceArc, numSlices]);

  // Função para indicar no WhatsApp e desbloquear a roleta
  const handleReferralShare = () => {
    // Limpar query string anterior
    const baseUrl = window.location.href.split("?")[0];
    const shareUrl = `${baseUrl}?indicacao=true`;
    const message = `Olá! Agendei um procedimento na Ferrer Innovare Clinic. Conheça os tratamentos e agende o seu também para liberarmos nossos bônus VIP: ${shareUrl}`;
    
    // Abrir redirecionamento do WhatsApp
    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");

    if (unlocked) return;

    // Desbloquear a roleta
    setUnlocked(true);
    showToast("Indicação enviada! Roleta destravada com sucesso.", "success");
    
    // Parar animação de rotação lenta
    if (rotationBoxRef.current) {
      rotationBoxRef.current.style.transform = "rotate(0deg)";
    }
  };

  // Lógica física de giro da roleta
  const handleSpinWheel = () => {
    if (spinning || !unlocked) return;

    setSpinning(true);

    // 1. Sortear prêmio (Garantir que NUNCA caia no "Tente Novamente" - índice 4)
    let sortedIndex;
    do {
      sortedIndex = Math.floor(Math.random() * premios.length);
    } while (premios[sortedIndex] === "Tente Novamente");

    // 2. Calcular rotação exata
    const sliceAngle = 360 / premios.length;
    const prizeAngle = sortedIndex * sliceAngle;
    const totalSpins = 5; // quantidade de voltas completas
    
    // Rotação acumulada = voltas completas + offset do topo (240) - ângulo do prêmio sorteado
    const nextRotation = (Math.ceil(accumulatedRotationRef.current / 360) * 360) + (totalSpins * 360) + 240 - prizeAngle;
    accumulatedRotationRef.current = nextRotation;

    // 3. Aplicar física de rotação via CSS no wrapper box
    const box = rotationBoxRef.current;
    if (box) {
      box.style.transition = "transform 4.5s cubic-bezier(0.1, 0.8, 0.1, 1)";
      box.style.transform = `rotate(${nextRotation}deg)`;
    }

    // 4. Conclusão do giro
    const handleTransitionEnd = () => {
      box.removeEventListener("transitionend", handleTransitionEnd);
      setSpinning(false);
      const wonPrize = premios[sortedIndex];

      showToast(`Parabéns! Você ganhou: "${wonPrize}"!`, "success");

      // Cupom de resgate
      if (wonPrize !== "Tente Novamente") {
        setTimeout(() => {
          const couponCode = `VIP-${Math.floor(Math.random() * 9000) + 1000}`;
          showToast(`Resgate na recepção com o código: ${couponCode}`, "success");
        }, 1500);
      }

      // Bloquear a roleta novamente após 4 segundos para incentivar novas indicações
      setTimeout(() => {
        setUnlocked(false);
        if (box) {
          box.style.transition = "none";
          box.style.transform = ""; // Volta para animação lenta do Tailwind
        }
      }, 4000);
    };

    box.addEventListener("transitionend", handleTransitionEnd);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Container visual da roleta */}
      <div className="relative w-[320px] h-[320px] flex items-center justify-center mb-6">
        
        {/* Ponteiro da Roleta (Indicador topo) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-[#C8A97E] z-30 drop-shadow-sm" />

        {/* Círculo Rotativo */}
        <div 
          ref={rotationBoxRef} 
          className={`w-[300px] h-[300px] rounded-full overflow-hidden border-4 border-white shadow-md z-10 ${
            !unlocked && !spinning ? "animate-[spin_20s_linear_infinite]" : ""
          }`}
        >
          <canvas 
            ref={canvasRef} 
            width={300} 
            height={300} 
            className="w-full h-full block"
          />
        </div>

        {/* Overlay de Bloqueio com Cadeado */}
        {!unlocked && !spinning && (
          <div className="absolute inset-0 bg-[#FDFBF7]/85 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn border border-[#EFEBE5]">
            <div className="p-3 bg-[#C8A97E]/10 rounded-full text-[#C8A97E] mb-2.5">
              <Lock size={28} />
            </div>
            <h3 className="font-serif font-semibold text-sm text-[#3E362E] mb-1">Giro Bloqueado</h3>
            <p className="text-[11px] text-[#7F7368] leading-normal max-w-[200px]">
              Indique uma amiga no botão abaixo para liberar sua jogada!
            </p>
          </div>
        )}
      </div>

      {/* Botões de Ação da Roleta */}
      <div className="w-full space-y-3">
        <button
          onClick={handleReferralShare}
          disabled={spinning}
          className="w-full border border-[#C8A97E] hover:bg-[#C8A97E]/5 disabled:opacity-40 disabled:cursor-not-allowed text-[#C8A97E] py-3.5 px-4 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Phone size={14} />
          <span>📲 Indicar no WhatsApp</span>
        </button>

        <button
          onClick={handleSpinWheel}
          disabled={!unlocked || spinning}
          className="w-full bg-[#C8A97E] hover:bg-[#B8996E] disabled:bg-[#EFEBE5] disabled:text-[#7F7368]/50 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider transition-all active:scale-[0.99]"
        >
          🎰 Girar Roleta
        </button>
      </div>
    </div>
  );
}
