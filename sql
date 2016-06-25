SELECT `Group` FROM (SELECT `Group`, COUNT(TorrentID) AS Num, SUM(Snatched) AS Snatched, SUM(Snatched) / COUNT(TorrentID) AS Ratio FROM torrents GROUP BY `Group`) AS T
WHERE Num > 10
ORDER BY Ratio DESC
