/**
 * Location Modal - Popup for GPS detection and address selection
 */
'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import styles from '../../styles/CheckoutModal.module.css';
import { STORE_LOCATION } from './utils';

// Import InteractiveMap directly - it already has 'use client' directive
import InteractiveMap from '../InteractiveMap';

const LocationModal = ({
  isOpen,
  onClose,
  onConfirm,
  geolocation,
  delivery
}) => {
  const [step, setStep] = useState('detecting'); // 'detecting' | 'map' | 'confirm'
  const [manualMode, setManualMode] = useState(false);

  // Start GPS detection when modal opens
  useEffect(() => {
    if (isOpen && !geolocation.position && !manualMode) {
      setStep('detecting');
      geolocation.detectLocation().then((result) => {
        if (result) {
          setStep('confirm');
        } else {
          setStep('map');
          setManualMode(true);
        }
      });
    } else if (isOpen && geolocation.position) {
      setStep('confirm');
    }
  }, [isOpen]);

  const handleSkipGps = useCallback(() => {
    setManualMode(true);
    setStep('map');
  }, []);

  const handleRetryGps = useCallback(() => {
    setManualMode(false);
    setStep('detecting');
    geolocation.detectLocation().then((result) => {
      if (result) {
        setStep('confirm');
      } else {
        setStep('map');
        setManualMode(true);
      }
    });
  }, [geolocation]);

  const handleMapLocationSelect = useCallback(async (location) => {
    const lat = location?.lat || location?.latitude;
    const lng = location?.lng || location?.longitude;
    
    if (lat && lng) {
      await geolocation.updateLocation(lat, lng);
      setStep('confirm');
    }
  }, [geolocation]);

  const handleConfirmLocation = useCallback(() => {
    if (geolocation.detectedAddress) {
      // Prefer geolocation.deliveryInfo as it's the most recent from the API
      const deliveryData = geolocation.deliveryInfo || delivery.deliveryInfo || { fee: 0, zone_name: 'Área de entrega' };
      onConfirm({
        address: geolocation.detectedAddress,
        position: geolocation.position,
        deliveryInfo: deliveryData,
        routeInfo: geolocation.routeInfo
      });
    }
  }, [geolocation, delivery, onConfirm]);

  const handleEditLocation = useCallback(() => {
    setStep('map');
  }, []);

  const formatDistance = (km) => {
    if (!km) return '';
    return km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)} km`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}min`;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>

        {/* Step 1: Detecting GPS */}
        {step === 'detecting' && (
          <div className={styles.detectingStep}>
            <div className={styles.gpsAnimation}>
              <div className={styles.pulseRing}></div>
              <div className={styles.gpsIcon}>📍</div>
            </div>
            <h2>Detectando sua localização...</h2>
            <p>Permita o acesso à localização para calcularmos a taxa de entrega</p>
            
            {geolocation.error && (
              <div className={styles.errorBox}>
                <p>{geolocation.error}</p>
                <div className={styles.errorActions}>
                  <button onClick={handleRetryGps} className={styles.retryBtn}>
                    🔄 Tentar novamente
                  </button>
                  <button onClick={handleSkipGps} className={styles.skipBtn}>
                    Inserir endereço manualmente
                  </button>
                </div>
              </div>
            )}

            {!geolocation.error && (
              <button onClick={handleSkipGps} className={styles.skipLink}>
                Prefiro inserir o endereço manualmente
              </button>
            )}
          </div>
        )}

        {/* Step 2: Map Selection */}
        {step === 'map' && (
          <div className={styles.mapStep}>
            <h2>Selecione seu endereço no mapa</h2>
            <p>Clique no mapa ou use a busca para encontrar seu endereço</p>

            <div className={styles.mapContainer}>
              <InteractiveMap
                storeLocation={STORE_LOCATION}
                customerLocation={geolocation.position}
                routePolyline={geolocation.routeInfo?.polyline}
                onLocationSelect={handleMapLocationSelect}
                enableSelection={true}
                showStoreMarker={true}
                showCustomerMarker={!!geolocation.position}
                height="350px"
              />
            </div>

            {geolocation.loading && (
              <div className={styles.loadingOverlay}>
                <div className={styles.spinner}></div>
                <p>Buscando endereço...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm Location */}
        {step === 'confirm' && geolocation.detectedAddress && (
          <div className={styles.confirmStep}>
            <h2>Confirme seu endereço</h2>

            {/* Map with route */}
            <div className={styles.mapContainer}>
              <InteractiveMap
                storeLocation={STORE_LOCATION}
                customerLocation={geolocation.position}
                routePolyline={geolocation.routeInfo?.polyline}
                enableSelection={false}
                showStoreMarker={true}
                showCustomerMarker={true}
                height="250px"
              />
            </div>

            {/* Delivery Info - Below Map */}
            <div className={styles.deliveryInfoCard}>
              {geolocation.routeInfo && (
                <div className={styles.routeStats}>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>📏</span>
                    <span className={styles.statValue}>{formatDistance(geolocation.routeInfo.distance_km)}</span>
                    <span className={styles.statLabel}>distância</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>⏱️</span>
                    <span className={styles.statValue}>{formatDuration(geolocation.routeInfo.duration_minutes)}</span>
                    <span className={styles.statLabel}>tempo estimado</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statIcon}>💰</span>
                    <span className={styles.statValue}>
                      {(geolocation.deliveryInfo?.fee || delivery.deliveryInfo?.fee) === 0 
                        ? 'Grátis' 
                        : `R$ ${(geolocation.deliveryInfo?.fee ?? delivery.deliveryInfo?.fee)?.toFixed(2) || '0.00'}`}
                    </span>
                    <span className={styles.statLabel}>taxa de entrega</span>
                  </div>
                </div>
              )}

              {(geolocation.deliveryInfo?.zone_name || delivery.deliveryInfo?.zone_name) && (
                <div className={styles.zoneTag}>
                  Zona: {geolocation.deliveryInfo?.zone_name || delivery.deliveryInfo?.zone_name}
                </div>
              )}
            </div>

            {/* Address Card */}
            <div className={styles.addressCard}>
              <div className={styles.addressIcon}>📍</div>
              <div className={styles.addressDetails}>
                <p className={styles.streetName}>
                  {geolocation.detectedAddress.street}
                  {geolocation.detectedAddress.number && `, ${geolocation.detectedAddress.number}`}
                </p>
                {geolocation.detectedAddress.neighborhood && (
                  <p className={styles.neighborhood}>{geolocation.detectedAddress.neighborhood}</p>
                )}
                <p className={styles.cityState}>
                  {geolocation.detectedAddress.city}
                  {geolocation.detectedAddress.state && ` - ${geolocation.detectedAddress.state}`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.confirmActions}>
              <button onClick={handleConfirmLocation} className={styles.confirmBtn}>
                ✓ Confirmar endereço
              </button>
              <button onClick={handleEditLocation} className={styles.editBtn}>
                ✏️ Alterar localização
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationModal;
