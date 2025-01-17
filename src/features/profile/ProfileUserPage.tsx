import InstagramIcon from '@mui/icons-material/Instagram';
import XIcon from '@mui/icons-material/X';
import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { Avatar, Box, Button, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { Profile, UserWithIcon } from '@/types/supabase';
import { supabaseClient } from '@/lib/supabaseClient';

// type Props = {};

export const ProfileUserPage: FC = () => {
  const [user, setUser] = useState<UserWithIcon | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);

  useEffect(() => {
    const userId = window.location.pathname.split('/').pop();
    if (!userId) return;

    (async () => {
      const profilePromise = supabaseClient.from('profiles').select('*').eq('id', userId);
      const userPromise = supabaseClient.from('users').select('*').eq('id', userId);

      const res = await Promise.all([profilePromise, userPromise]);

      if (!res[0].data || !res[1].data) return;

      const profile = res[0].data[0];
      const user = res[1].data[0];

      const photo = await supabaseClient.from('photos').select('*').eq('id', user.icon_img_id);
      if (!photo.data) return;

      const photos = await supabaseClient.from('profile_photos').select('*').eq('id', userId);
      if (!photos.data) return;

      const photoIds = photos.data.map((photo) => photo.img_id);
      const photoUrls = (await Promise.all(
        photoIds.map(async (id) => {
          const res = await supabaseClient.from('photos').select('img_url').eq('id', id);
          return res.data?.[0]?.img_url;
        })
      ).then((urls) => urls.filter((url) => url))) as string[];

      setProfilePhotos(photoUrls);

      setUser({ ...user, icon: photo.data[0].img_url });
      setProfile(profile);
    })();
  }, []);

  if (!user || !profile) return null;
  return (
    <HeaderLayout withHome label={user?.nickname ?? user?.name_line ?? 'プロフィール'}>
      <Stack sx={{ pt: 1, pb: 3 }} spacing={1}>
        <Stack
          sx={{
            width: '100%',
            p: 3,
            py: 1,
            borderRadius: '10px',
            background: `linear-gradient(to top right, rgba(217, 175, 217, 0.7) 0%, rgba(151, 217, 225, 0.7) 100%),url(${user.icon})`,
          }}
        >
          <Avatar src={user?.icon ?? ''} sx={{ width: '65px', height: '65px', margin: 'auto' }} />
        </Stack>
        {profilePhotos.length > 0 && (
          <Stack
            sx={{ pt: 1, pb: 1.5, width: '100%' }}
            direction="row"
            justifyContent="space-between"
            alignItems="flex-end"
          >
            <Typography sx={{ fontWeight: 'bold' }}>写真</Typography>
          </Stack>
        )}
        {profilePhotos.length > 0 && <Box height={'200px'} />}
        <Stack
          sx={{
            width: '95dvw',
            position: 'absolute',
            top: '195px',
            overflowX: 'auto',
            pt: 0.5,
          }}
        >
          <Stack direction="row" spacing={2}>
            {profilePhotos.length > 0 &&
              profilePhotos.map((photo, index) => (
                <Stack
                  key={`${photo}-${
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    index
                  }`}
                  sx={{
                    width: '200px',
                    height: '200px',
                    aspectRatio: '1/1',
                  }}
                >
                  <Button sx={{ p: 0 }} disabled>
                    <img
                      alt="profile"
                      src={photo}
                      style={{
                        height: '100%',
                        width: '100%',
                        borderRadius: '10px',
                        aspectRatio: '1/1',
                        objectFit: 'cover',
                      }}
                    />
                  </Button>
                </Stack>
              ))}
          </Stack>
        </Stack>
        <Stack
          sx={{ pt: 1, pb: 1.5, width: '100%' }}
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <Typography sx={{ fontWeight: 'bold' }}>自己紹介</Typography>
        </Stack>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={profile?.introduction ?? ''}
          sx={{ pointerEvents: 'none' }}
        />
        <Typography sx={{ fontWeight: 'bold' }}>SNS</Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<InstagramIcon />}
            sx={{
              color: 'black',
              fontWeight: 'bold',
              textAlign: 'left',
              borderColor: 'gray',
              borderWidth: '0.9px',
              px: 2,
              overflow: 'hidden',
            }}
            onClick={() => {
              if (!profile?.instagram) return;
              window.open(`https://www.instagram.com/${profile.instagram}`);
            }}
          >
            {profile?.instagram ?? '未設定'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<XIcon />}
            sx={{
              color: 'black',
              fontWeight: 'bold',
              borderColor: 'gray',
              borderWidth: '0.9px',
              px: 2,
              overflow: 'hidden',
            }}
            onClick={() => {
              if (!profile?.twitter) return;
              window.open(`https://twitter.com/${profile.twitter}`);
            }}
          >
            {profile?.twitter ?? '未設定'}
          </Button>
        </Stack>
        <Stack
          sx={{ pt: 1, pb: 1.5, width: '100%' }}
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography sx={{ fontWeight: 'bold' }}>基本項目</Typography>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
            ニックネーム
          </Typography>
          <Stack>
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              value={user?.nickname}
              sx={{ pointerEvents: 'none' }}
            />
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
            MBTI
          </Typography>
          <Stack>
            <Select
              value={profile?.personal_types ?? '未選択'}
              size="small"
              sx={{ pointerEvents: 'none' }}
            >
              {[
                'ESTP（起業家）',
                'ESFP（エンターテイナー）',
                'ENTP（討論者）',
                'ENFP（広報担当者）',
                'ESTJ（幹部）',
                'ESFJ（領事館員）',
                'ENTJ（指揮官）',
                'ENFJ（主人公）',
                'ISTP（職人）',
                'ISFP（冒険者）',
                'INTP（論理学者）',
                'INFP（仲介者）',
                'ISTJ（現実主義者）',
                'ISFJ（擁護者）',
                'INTJ（建築家）',
                'INFJ（提唱者）',
                '未選択',
              ].map((type) => (
                <MenuItem value={type} key={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 'bold', color: 'gray', pointerEvents: 'none' }}
          >
            血液型
          </Typography>
          <Stack>
            <Select value={profile?.blood_type ?? '未選択'} size="small">
              {['A型', 'B型', 'O型', 'AB型', '未選択'].map((type) => (
                <MenuItem value={type} key={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 'bold', color: 'gray', pointerEvents: 'none' }}
          >
            居住地
          </Typography>
          <Stack>
            <Select
              value={profile?.address ?? '未選択'}
              size="small"
              sx={{ pointerEvents: 'none' }}
            >
              <MenuItem value={'岐阜県'}>岐阜県</MenuItem>
              <MenuItem value={'三重県'}>三重県</MenuItem>
              <MenuItem value={'愛知県'}>愛知県</MenuItem>
              <MenuItem value={'未選択'}>未選択</MenuItem>
            </Select>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
            学校
          </Typography>
          <Stack>
            <TextField
              variant="outlined"
              fullWidth
              size="small"
              value={profile?.school ?? ''}
              sx={{ pointerEvents: 'none' }}
            />
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
            タバコ
          </Typography>
          <Stack>
            <Select
              value={profile?.cigarettes ?? '未選択'}
              size="small"
              sx={{ pointerEvents: 'none' }}
            >
              <MenuItem value={'吸う'}>吸う</MenuItem>
              <MenuItem value={'吸わない'}>吸わない</MenuItem>
              <MenuItem value={'未選択'}>未選択</MenuItem>
            </Select>
          </Stack>
        </Stack>
        <Stack spacing={0.5}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'gray' }}>
            お酒
          </Typography>
          <Select value={profile?.alcohol ?? '未選択'} size="small" sx={{ pointerEvents: 'none' }}>
            <MenuItem value={'ときどき飲む'}>ときどき飲む</MenuItem>
            <MenuItem value={'飲む'}>飲む</MenuItem>
            <MenuItem value={'飲まない'}>飲まない</MenuItem>
            <MenuItem value={'未選択'}>未選択</MenuItem>
          </Select>
        </Stack>
      </Stack>
    </HeaderLayout>
  );
};
