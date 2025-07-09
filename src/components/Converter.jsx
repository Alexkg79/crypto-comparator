import { useState, useEffect } from 'react';

export default function Converter({ cryptoSymbol, fiatSymbol, currentPrice }) {
  const [cryptoAmount, setCryptoAmount] = useState(1);
  const [fiatAmount, setFiatAmount] = useState(currentPrice);

  useEffect(() => {
    // S'assure que le montant fiat est correct si le prix change
    handleCryptoChange({ target: { value: cryptoAmount.toString() } });
  }, [currentPrice]);


  const handleCryptoChange = (e) => {
    const value = e.target.value;
    setCryptoAmount(value);

    // Si le champ est vide ou n'est pas un nombre valide, on vide l'autre champ.
    if (value === '' || isNaN(parseFloat(value))) {
      setFiatAmount('');
      return;
    }

    // Si tout va bien, on fait le calcul.
    setFiatAmount(parseFloat(value) * currentPrice);
  };

  const handleFiatChange = (e) => {
    const value = e.target.value;
    setFiatAmount(value);

    if (value === '' || isNaN(parseFloat(value))) {
      setCryptoAmount('');
      return;
    }

    setCryptoAmount(parseFloat(value) / currentPrice);
  };

  return (
    <div className="converter">
      <h3 className="converter__title">Convertisseur {cryptoSymbol} / {fiatSymbol}</h3>
      <div className="converter__inputs">
        <div className="converter__row">
          <span className="converter__symbol">{cryptoSymbol}</span>
          <input
            type="number"
            className="converter__input"
            // On utilise directement la valeur de l'état, qui peut être une chaîne vide
            value={cryptoAmount}
            onChange={handleCryptoChange}
          />
        </div>
        <div className="converter__row">
          <span className="converter__symbol">{fiatSymbol}</span>
          <input
            type="number"
            className="converter__input"
            // On gère l'affichage pour n'avoir que 2 décimales si c'est un nombre
            value={typeof fiatAmount === 'number' ? parseFloat(fiatAmount.toFixed(2)) : fiatAmount}
            onChange={handleFiatChange}
          />
        </div>
      </div>
    </div>
  );
}