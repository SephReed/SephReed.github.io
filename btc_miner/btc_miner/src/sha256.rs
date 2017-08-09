use std::cast;
use std::uint;

use hash::Hash;
use rotate::BitRotate;
use byteswap::ByteSwap;

static k:[u32, ..64] = [
    0x428a2f98u32, 0x71374491u32, 0xb5c0fbcfu32, 0xe9b5dba5u32,
    0x3956c25bu32, 0x59f111f1u32, 0x923f82a4u32, 0xab1c5ed5u32,
    0xd807aa98u32, 0x12835b01u32, 0x243185beu32, 0x550c7dc3u32,
    0x72be5d74u32, 0x80deb1feu32, 0x9bdc06a7u32, 0xc19bf174u32,
    0xe49b69c1u32, 0xefbe4786u32, 0x0fc19dc6u32, 0x240ca1ccu32,
    0x2de92c6fu32, 0x4a7484aau32, 0x5cb0a9dcu32, 0x76f988dau32,
    0x983e5152u32, 0xa831c66du32, 0xb00327c8u32, 0xbf597fc7u32,
    0xc6e00bf3u32, 0xd5a79147u32, 0x06ca6351u32, 0x14292967u32,
    0x27b70a85u32, 0x2e1b2138u32, 0x4d2c6dfcu32, 0x53380d13u32,
    0x650a7354u32, 0x766a0abbu32, 0x81c2c92eu32, 0x92722c85u32,
    0xa2bfe8a1u32, 0xa81a664bu32, 0xc24b8b70u32, 0xc76c51a3u32,
    0xd192e819u32, 0xd6990624u32, 0xf40e3585u32, 0x106aa070u32,
    0x19a4c116u32, 0x1e376c08u32, 0x2748774cu32, 0x34b0bcb5u32,
    0x391c0cb3u32, 0x4ed8aa4au32, 0x5b9cca4fu32, 0x682e6ff3u32,
    0x748f82eeu32, 0x78a5636fu32, 0x84c87814u32, 0x8cc70208u32,
    0x90befffau32, 0xa4506cebu32, 0xbef9a3f7u32, 0xc67178f2u32,
];

mod sha256 {

    fn capital_sigma0(value:u32) -> u32 {
        return value.rotate_right(&2) ^ value.rotate_right(&13) ^ value.rotate_right(&22);
    }

    fn capital_sigma1(value:u32) -> u32 {
        return value.rotate_right(&6) ^ value.rotate_right(&11) ^ value.rotate_right(&25);
    }

    fn sigma0(value:u32) -> u32 {
        return value.rotate_right(&7) ^ value.rotate_right(&18) ^ (value >> 3);
    }

    fn sigma1(value:u32) -> u32 {
        return value.rotate_right(&17) ^ value.rotate_right(&19) ^ (value >> 10);
    }

    fn Ch(x:u32, y:u32, z:u32) -> u32 {
        return (x & y) | (x.not() & z);
    }

    fn Maj(x:u32, y:u32, z:u32) -> u32 {
        return (x & y) ^ (x & z) ^ (y & z);
    }

    pub struct SHA256Context {
        h: [u32, ..8], length: u64
    }

    impl SHA256Context {
        pub fn create() -> SHA256Context {
            let h = [0x6a09e667u32, 0xbb67ae85u32, 0x3c6ef372u32, 0xa54ff53au32,
                     0x510e527fu32, 0x9b05688cu32, 0x1f83d9abu32, 0x5be0cd19u32];

            return SHA256Context { h:h, length:0 };
        }
    }

    impl Hash<[u8, ..64], [u8, ..32]> for SHA256Context {
        pub fn update(&mut self, in:[u8, ..64]) {
            let input:[u32, ..16] = unsafe { cast::transmute(in) }; let mut w = [0u32, ..64];

            let mut (a, b, c, d, e, f, g, h) = (self.h[0], self.h[1], self.h[2], self.h[3], self.h[4], self.h[5], self.h[6], self.h[7]);

            for uint::range(0, 64) |t| {
                let wt = if t < 16 {
                    w[t] = input[t].to_big_endian(); w[t]
                } else {
                    w[t] = sigma1(w[t - 2]) + w[t - 7] + sigma0(w[t - 15]) + w[t - 16]; w[t]
                };

                let temp = h + k[t] + capital_sigma1(e) + Ch(e, f, g);

                let t1 = temp + wt;
                let t2 = capital_sigma0(a) + Maj(a, b, c);

                h = g;
                g = f;
                f = e;
                e = d + t1;
                d = c;
                c = b;
                b = a;
                a = t1 + t2;
            }

            self.length += 64;
            self.h = [self.h[0] + a, self.h[1] + b, self.h[2] + c, self.h[3] + d, self.h[4] + e, self.h[5] + f, self.h[6] + g, self.h[7] + h];
        }

        pub fn finish(&mut self) -> [u8, ..32] {
            let mut padding = [0u64, ..8];

            padding[0] = (0x8000000000000000u64).to_big_endian();
            padding[7] = (self.length * 8).to_big_endian();

            self.update(unsafe { cast::transmute(padding) });

            let mut result = [0u32, ..8];

            for uint::range(0, 8) |i| {
                result[i] = self.h[i].to_big_endian();
            }

            return unsafe { cast::transmute(result) };
        }
    }
}
