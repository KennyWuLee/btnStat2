SELECT `Group` FROM (SELECT `Group`, COUNT(TorrentID) AS Num, SUM(Snatched) AS Snatched, SUM(Snatched) / COUNT(TorrentID) AS Ratio FROM torrents GROUP BY `Group`) AS T
WHERE Num > 20 AND Ratio > 75
ORDER BY Ratio DESC
