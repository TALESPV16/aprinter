/**
 * @file
 * MIB2 callback functions called from throughout the stack to integrate a MIB2
 * into lwIP (together with MIB2_STATS).
 */

/*
 * Copyright (c) 2001-2004 Swedish Institute of Computer Science.
 * All rights reserved. 
 * 
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission. 
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED 
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT 
 * SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, 
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS 
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN 
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING 
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY 
 * OF SUCH DAMAGE.
 *
 * This file is part of the lwIP TCP/IP stack.
 * 
 * Author: Dirk Ziegelmeier <dziegel@gmx.de>
 *
 */
#ifndef LWIP_HDR_SNMP_MIB2_H
#define LWIP_HDR_SNMP_MIB2_H

#include "lwip/opt.h"
#include "lwip/def.h"
#include "lwip/ip_addr.h"

LWIP_EXTERN_C_BEGIN

struct udp_pcb;
struct netif;

/* MIB2 statistics functions */
#if MIB2_STATS  /* don't build if not configured for use in lwipopts.h */
/**
 * @see RFC1213, "MIB-II, 6. Definitions"
 */
enum snmp_ifType {
  snmp_ifType_other=1,                /* none of the following */
  snmp_ifType_regular1822,
  snmp_ifType_hdh1822,
  snmp_ifType_ddn_x25,
  snmp_ifType_rfc877_x25,
  snmp_ifType_ethernet_csmacd,
  snmp_ifType_iso88023_csmacd,
  snmp_ifType_iso88024_tokenBus,
  snmp_ifType_iso88025_tokenRing,
  snmp_ifType_iso88026_man,
  snmp_ifType_starLan,
  snmp_ifType_proteon_10Mbit,
  snmp_ifType_proteon_80Mbit,
  snmp_ifType_hyperchannel,
  snmp_ifType_fddi,
  snmp_ifType_lapb,
  snmp_ifType_sdlc,
  snmp_ifType_ds1,                    /* T-1 */
  snmp_ifType_e1,                     /* european equiv. of T-1 */
  snmp_ifType_basicISDN,
  snmp_ifType_primaryISDN,            /* proprietary serial */
  snmp_ifType_propPointToPointSerial,
  snmp_ifType_ppp,
  snmp_ifType_softwareLoopback,
  snmp_ifType_eon,                    /* CLNP over IP [11] */
  snmp_ifType_ethernet_3Mbit,
  snmp_ifType_nsip,                   /* XNS over IP */
  snmp_ifType_slip,                   /* generic SLIP */
  snmp_ifType_ultra,                  /* ULTRA technologies */
  snmp_ifType_ds3,                    /* T-3 */
  snmp_ifType_sip,                    /* SMDS */
  snmp_ifType_frame_relay
};

/* This macro has a precision of ~49 days because sys_now returns u32_t. #define your own if you want ~490 days. */
#ifndef MIB2_COPY_SYSUPTIME_TO
#define MIB2_COPY_SYSUPTIME_TO(ptrToVal) (*(ptrToVal) = (sys_now() / 10))
#endif

#define MIB2_STATS_NETIF_INC(n, x)      do { ++(n)->mib2_counters.x; } while(0)
#define MIB2_STATS_NETIF_ADD(n, x, val) do { (n)->mib2_counters.x += (val); } while(0)

#define MIB2_INIT_NETIF(netif, type, speed) do { \
  /* use "snmp_ifType" enum from snmp_mib2.h for "type", snmp_ifType_ethernet_csmacd by example */ \
  (netif)->link_type = (type);  \
  /* your link speed here (units: bits per second) */  \
  (netif)->link_speed = (speed);\
  (netif)->ts = 0;              \
  (netif)->mib2_counters.ifinoctets = 0;      \
  (netif)->mib2_counters.ifinucastpkts = 0;   \
  (netif)->mib2_counters.ifinnucastpkts = 0;  \
  (netif)->mib2_counters.ifindiscards = 0;    \
  (netif)->mib2_counters.ifinerrors = 0;    \
  (netif)->mib2_counters.ifinunknownprotos = 0;    \
  (netif)->mib2_counters.ifoutoctets = 0;     \
  (netif)->mib2_counters.ifoutucastpkts = 0;  \
  (netif)->mib2_counters.ifoutnucastpkts = 0; \
  (netif)->mib2_counters.ifoutdiscards = 0; \
  (netif)->mib2_counters.ifouterrors = 0; } while(0)
#else /* MIB2_STATS */
#ifndef MIB2_COPY_SYSUPTIME_TO
#define MIB2_COPY_SYSUPTIME_TO(ptrToVal)
#endif
#define MIB2_INIT_NETIF(netif, type, speed)
#define MIB2_STATS_NETIF_INC(n, x)
#define MIB2_STATS_NETIF_ADD(n, x, val)
#endif /* MIB2_STATS */

/* LWIP MIB2 callbacks */
#if LWIP_MIB2_CALLBACKS /* don't build if not configured for use in lwipopts.h */
/* network interface */
void mib2_netif_added(struct netif *ni);
void mib2_netif_removed(struct netif *ni);

#if LWIP_IPV4 && LWIP_ARP
/* ARP (for atTable and ipNetToMediaTable) */
void mib2_add_arp_entry(struct netif *ni, ip4_addr_t *ip);
void mib2_remove_arp_entry(struct netif *ni, ip4_addr_t *ip);
#else /* LWIP_IPV4 && LWIP_ARP */
#define mib2_add_arp_entry(ni,ip)
#define mib2_remove_arp_entry(ni,ip)
#endif /* LWIP_IPV4 && LWIP_ARP */

/* IP */
void mib2_add_ip4(struct netif *ni);
void mib2_remove_ip4(struct netif *ni);
void mib2_add_route_ip4(u8_t dflt, struct netif *ni);
void mib2_remove_route_ip4(u8_t dflt, struct netif *ni);

/* UDP */
void mib2_udp_bind(struct udp_pcb *pcb);
void mib2_udp_unbind(struct udp_pcb *pcb);

#else /* LWIP_MIB2_CALLBACKS */
/* LWIP_MIB2_CALLBACKS support not available */
/* define everything to be empty */

/* network interface */
#define mib2_netif_added(ni)
#define mib2_netif_removed(ni)

/* ARP */
#define mib2_add_arp_entry(ni,ip)
#define mib2_remove_arp_entry(ni,ip)

/* IP */
#define mib2_add_ip4(ni)
#define mib2_remove_ip4(ni)
#define mib2_add_route_ip4(dflt, ni)
#define mib2_remove_route_ip4(dflt, ni)

/* UDP */
#define mib2_udp_bind(pcb)
#define mib2_udp_unbind(pcb)
#endif /* LWIP_MIB2_CALLBACKS */

LWIP_EXTERN_C_END

#endif /* LWIP_HDR_SNMP_MIB2_H */
